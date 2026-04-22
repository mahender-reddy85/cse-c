import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { RequestDoc, Submission } from '../types';
import { Send, Upload, Clock, CheckCircle2, XCircle, FilePlus, MessageCirclePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Requests: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'submit' | 'history'>('request');
  
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
      setMessage({ type: 'success', text: 'REQUEST_TRANSMITTED_SUCCESSFULLY' });
      setReqTitle(''); setReqSubject(''); setReqUnit('');
    } catch (err) {
      setMessage({ type: 'error', text: 'TRANSMISSION_FAILED' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !subFile) return;
    
    if (subFile.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'FILE_SIZE_EXCEEDS_10MB_LIMIT' });
      return;
    }

    setLoading(true);
    try {
      const userEmail = user.email || profile.email;
      const fileRef = ref(storage, `submissions/${Date.now()}_${subFile.name}`);
      await uploadBytes(fileRef, subFile);
      const fileUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'submissions'), {
        title: subTitle,
        subject: subSubject,
        unit: subUnit,
        fileUrl,
        submittedBy: userEmail,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'SUBMISSION_UPLINK_COMPLETE' });
      setSubTitle(''); setSubSubject(''); setSubUnit(''); setSubFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'UPLINK_PROTOCOL_FAILURE' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Communications
        </h1>
        <p className="text-xs text-slate-500 font-medium">Request specific documents or contribute your own material</p>
      </header>

      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'request', label: 'Request Doc', icon: MessageCirclePlus },
          { id: 'submit', label: 'Submit Resource', icon: FilePlus },
          { id: 'history', label: 'My Activity', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all relative ${
              activeTab === tab.id 
              ? 'text-brand-600' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 border rounded-lg text-sm font-medium flex items-center justify-between ${
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

      <div className="mt-8">
        {activeTab === 'request' && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleRequest} 
            className="card p-8 space-y-6"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Title</label>
                <input required value={reqTitle} onChange={e => setReqTitle(e.target.value)} className="input-field" placeholder="e.g. Operating Systems Previous Year Paper" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                  <input required value={reqSubject} onChange={e => setReqSubject(e.target.value)} className="input-field" placeholder="Select or type subject" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                  <input required value={reqUnit} onChange={e => setReqUnit(e.target.value)} className="input-field" placeholder="e.g. Unit 3" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              <Send size={18} />
              <span>{loading ? 'Transmitting Request...' : 'Submit Request'}</span>
            </button>
          </motion.form>
        )}

        {activeTab === 'submit' && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="card p-8 space-y-6"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resource Title</label>
                <input required value={subTitle} onChange={e => setSubTitle(e.target.value)} className="input-field" placeholder="e.g. DBMS Handwritten Notes" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                  <input required value={subSubject} onChange={e => setSubSubject(e.target.value)} className="input-field" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                  <input required value={subUnit} onChange={e => setSubUnit(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payload File (Max 10MB)</label>
                <div className="border-2 border-dashed border-slate-200 p-10 rounded-xl text-center hover:border-brand-300 transition-colors cursor-pointer relative bg-slate-50/50 group">
                  <input 
                    type="file" 
                    required 
                    onChange={e => setSubFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,image/*"
                  />
                  <Upload className="mx-auto mb-3 text-slate-300 group-hover:text-brand-600 transition-colors" size={40} />
                  <p className="text-sm font-semibold text-slate-600">
                    {subFile ? subFile.name : 'Click or drag to upload document'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">Accepted formats: PDF, JPG, PNG</p>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              <Upload size={18} />
              <span>{loading ? 'Uploading Resource...' : 'Submit to Admin'}</span>
            </button>
          </motion.form>
        )}

        {activeTab === 'history' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <section>
              <h3 className="text-xs font-bold text-slate-400 mb-4 px-1 uppercase tracking-widest leading-none">My Requests</h3>
              <div className="space-y-3">
                {myRequests.map(r => (
                  <div key={r.id} className="card p-4 flex items-center justify-between border-slate-100 shadow-none hover:shadow-sm transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{r.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase">{r.subject} • Unit {r.unit}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      r.status === 'fulfilled' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
                {myRequests.length === 0 && (
                  <div className="card p-8 text-center bg-slate-50 border-dashed shadow-none">
                    <p className="text-xs font-bold text-slate-300 uppercase italic">No requests logged</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 mb-4 px-1 uppercase tracking-widest leading-none">My Submissions</h3>
              <div className="space-y-3">
                {mySubmissions.map(s => (
                  <div key={s.id} className="card p-4 flex items-center justify-between border-slate-100 shadow-none hover:shadow-sm transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase">{s.subject} • {new Date(s.createdAt?.toDate()).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       {s.status === 'approved' && <CheckCircle2 size={16} className="text-green-500" />}
                       {s.status === 'rejected' && <XCircle size={16} className="text-red-500" />}
                       {s.status === 'pending' && <Clock size={16} className="text-slate-300 animate-pulse" />}
                       <span className={`text-[10px] font-bold uppercase ${
                         s.status === 'approved' ? 'text-green-500' : s.status === 'rejected' ? 'text-red-500' : 'text-slate-400'
                       }`}>{s.status}</span>
                    </div>
                  </div>
                ))}
                {mySubmissions.length === 0 && (
                  <div className="card p-8 text-center bg-slate-50 border-dashed shadow-none">
                    <p className="text-xs font-bold text-slate-300 uppercase italic">No submissions logged</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};
