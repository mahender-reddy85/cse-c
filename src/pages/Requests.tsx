import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useAuth } from '../context/AuthContext';
import { RequestDoc, Submission } from '../types';
import { Send, Upload, CheckCircle2, XCircle, FilePlus, MessageCirclePlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Requests: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'submit'>('request');
  
  // Form States
  const [reqTitle, setReqTitle] = useState('');
  const [reqSubject, setReqSubject] = useState('');
  const [reqUnit, setReqUnit] = useState('');
  
  const [subTitle, setSubTitle] = useState('');
  const [subSubject, setSubSubject] = useState('');
  const [subUnit, setSubUnit] = useState('');
  const [subFile, setSubFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [submitAnimation, setSubmitAnimation] = useState<'submit' | 'request' | null>(null);

  // History States
  const [myRequests, setMyRequests] = useState<RequestDoc[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!user || authLoading || !profile) return;
    
    // Use profile email as fallback for anonymous users
    const userEmail = user.email || profile.email;
    
    const qReq = query(collection(db, 'requests'), where('requestedBy', '==', userEmail), orderBy('createdAt', 'desc'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setMyRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as RequestDoc)));
    });

    const qSub = query(collection(db, 'submissions'), where('submittedBy', '==', userEmail), orderBy('createdAt', 'desc'));
    const unsubSub = onSnapshot(qSub, (snap) => {
      setMySubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
    });

    return () => { unsubReq(); unsubSub(); };
  }, [user, profile, authLoading]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    try {
      const userEmail = user.email || profile.email;
      await addDoc(collection(db, 'requests'), {
        title: reqTitle,
        subject: reqSubject,
        unit: reqUnit,
        requestedBy: userEmail,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setSubmitAnimation('request');
      setMessage({ type: 'success', text: 'REQUEST_TRANSMITTED_SUCCESSFULLY' });
      setReqTitle(''); setReqSubject(''); setReqUnit('');
    } catch (err) {
      setMessage({ type: 'error', text: 'TRANSMISSION_FAILED' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFile || !user || !profile || loading) return;

    // Client-side validation
    if (subFile.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'FILE_SIZE_EXCEEDS_10MB_LIMIT' });
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(subFile.type)) {
      setMessage({ type: 'error', text: 'ONLY_PDF_AND_IMAGES_SUPPORTED' });
      return;
    }

    setLoading(true);
    try {
      const userEmail = user.email || profile.email;
      
      // Construct organized folder path for student submissions
      const sanitizedSubject = subSubject.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const sanitizedUnit = subUnit.toLowerCase().trim().includes('unit') 
        ? subUnit.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') 
        : `unit-${subUnit.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
      
      const folderPath = `cse-c/submissions/${sanitizedSubject}/${sanitizedUnit}`;
      
      const fileUrl = await uploadToCloudinary(subFile, folderPath);

      await addDoc(collection(db, 'submissions'), {
        title: subTitle,
        subject: subSubject,
        unit: subUnit,
        fileUrl,
        submittedBy: userEmail,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSubmitAnimation('submit');
      setMessage({ type: 'success', text: 'SUBMISSION_UPLINK_COMPLETE' });
      setSubTitle(''); setSubSubject(''); setSubUnit(''); setSubFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'UPLINK_PROTOCOL_FAILURE' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Dividing Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 transform -translate-x-1/2 hidden lg:block"></div>
        
        {/* Left Column - Submit Resource Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FilePlus size={16} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Submit Resource</h2>
          </div>
          
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmission} 
            className="card p-5 space-y-4 relative"
          >
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Resource Title</label>
                <input required value={subTitle} onChange={e => setSubTitle(e.target.value)} className="input-field text-sm py-2" placeholder="e.g. DBMS Handwritten Notes" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                  <input required value={subSubject} onChange={e => setSubSubject(e.target.value)} className="input-field text-sm py-2" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unit</label>
                  <input value={subUnit} onChange={e => setSubUnit(e.target.value)} className="input-field text-sm py-2" placeholder="e.g. Unit 1" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payload File (Max 10MB)</label>
                <div className="border-2 border-dashed border-slate-200 p-4 rounded-lg text-center hover:border-blue-300 transition-colors cursor-pointer relative bg-slate-50/50 group">
                  <input 
                    type="file" 
                    required 
                    onChange={e => setSubFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,image/*"
                  />
                  <Upload className="mx-auto mb-2 text-slate-300 group-hover:text-blue-600 transition-colors" size={24} />
                  <p className="text-xs font-semibold text-slate-600">
                    {subFile ? subFile.name : 'Click or drag to upload document'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium uppercase tracking-tighter">Accepted formats: PDF, JPG, PNG</p>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm">
              <Upload size={14} />
              <span>{loading ? 'Uploading...' : 'Submit to Admin'}</span>
            </button>
          </motion.form>
        </div>

        {/* Right Column - Request Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCirclePlus size={16} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Request Doc</h2>
          </div>
          
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleRequest} 
            className="card p-5 space-y-4 relative"
          >
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Title</label>
                <input required value={reqTitle} onChange={e => setReqTitle(e.target.value)} className="input-field text-sm py-2" placeholder="e.g. Operating Systems Previous Year Paper" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                  <input required value={reqSubject} onChange={e => setReqSubject(e.target.value)} className="input-field text-sm py-2" placeholder="Select or type subject" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unit</label>
                  <input value={reqUnit} onChange={e => setReqUnit(e.target.value)} className="input-field text-sm py-2" placeholder="e.g. Unit 3" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm">
              <Send size={14} />
              <span>{loading ? 'Transmitting...' : 'Submit Request'}</span>
            </button>
          </motion.form>
        </div>
      </div>

      {/* Global Success Animation */}
      <AnimatePresence>
        {submitAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white p-10 rounded-[32px] shadow-2xl flex flex-col items-center gap-6 max-w-xs w-full"
              onAnimationComplete={() => setTimeout(() => setSubmitAnimation(null), 2500)}
            >
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M30 52 L45 67 L70 37"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                  />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <motion.h3
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-slate-900 font-bold text-lg"
                >
                  Success!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="text-slate-500 font-medium text-sm"
                >
                  {submitAnimation === 'submit' ? 'Document uploaded to admin.' : 'Your request has been sent.'}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Message Toast */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 p-4 border rounded-lg text-sm font-medium flex items-center justify-between max-w-md ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {message.text}
            </div>
            <button onClick={() => setMessage(null)} className="text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
