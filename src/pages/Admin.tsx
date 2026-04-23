import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useAuth } from '../context/AuthContext';
import { Document, RequestDoc, Submission } from '../types';
import { Plus, Trash2, Edit2, Check, X, Inbox, FileUp, List, MessageSquare, ClipboardCheck, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'requests' | 'submissions'>('upload');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Upload Form
  const [title, setTitle] = useState('');
  const [exam, setExam] = useState<'Mid-1' | 'Mid-2' | 'SEM'>('Mid-1');
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Lists
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requests, setRequests] = useState<RequestDoc[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const unsubDocs = onSnapshot(query(collection(db, 'documents'), orderBy('createdAt', 'desc')), (snap) => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Document)));
    });
    const unsubReqs = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc')), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as RequestDoc)));
    });
    const unsubSubs = onSnapshot(query(collection(db, 'submissions'), orderBy('createdAt', 'desc')), (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
    });
    return () => { unsubDocs(); unsubReqs(); unsubSubs(); };
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    // Client-side validation
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: 'error', text: 'FILE_SIZE_EXCEEDS_10MB_LIMIT' });
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setStatus({ type: 'error', text: 'ONLY_PDF_AND_IMAGES_SUPPORTED' });
      return;
    }

    setLoading(true);
    try {
      // Construct organized folder path: cse-c/mid/subject/unit-1
      const examType = exam.toLowerCase().includes('mid') ? 'mid' : 'sem';
      const sanitizedSubject = subject.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const sanitizedUnit = unit.toLowerCase().trim().includes('unit') 
        ? unit.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') 
        : `unit-${unit.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
      
      const folderPath = `cse-c/${examType}/${sanitizedSubject}/${sanitizedUnit}`;
      
      const fileUrl = await uploadToCloudinary(file, folderPath);
      
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';

      await addDoc(collection(db, 'documents'), {
        title,
        exam,
        subject,
        unit,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        fileUrl,
        fileType,
        uploadedBy: user.email,
        createdAt: serverTimestamp()
      });

      setShowSuccess(true);
      setTitle(''); setSubject(''); setUnit(''); setTags(''); setFile(null);
    } catch (err: any) {
      setStatus({ type: 'error', text: 'DEPLOYMENT_ERROR: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmission = async (sub: Submission) => {
    try {
      // 1. Mark submission as approved
      await updateDoc(doc(db, 'submissions', sub.id), { status: 'approved' });
      
      // 2. Add as a document
      await addDoc(collection(db, 'documents'), {
        title: sub.title,
        exam: 'Mid-1', // Default, admin can edit later
        subject: sub.subject,
        unit: sub.unit,
        tags: ['student-submission'],
        fileUrl: sub.fileUrl,
        fileType: sub.fileUrl.includes('.pdf') ? 'pdf' : 'image',
        uploadedBy: sub.submittedBy,
        createdAt: serverTimestamp()
      });
      setStatus({ type: 'success', text: 'SUBMISSION_APPROVED_AND_MOVED_TO_DOCS' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFulfillRequest = async (id: string) => {
    await updateDoc(doc(db, 'requests', id), { status: 'fulfilled' });
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm('DESTRUCT_SEQUENCE_INITIALIZED? CONFIRM_DELETION')) {
      await deleteDoc(doc(db, 'documents', id));
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Admin Interface
        </h1>
        <p className="text-xs text-slate-500 font-medium">Manage repository contents and user interactions</p>
      </header>

      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'upload', label: 'Upload New', icon: FileUp },
          { id: 'manage', label: 'Manage All', icon: List },
          { id: 'requests', label: 'User Requests', icon: MessageSquare },
          { id: 'submissions', label: 'User Submissions', icon: ClipboardCheck },
        ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab.id 
                ? 'text-blue-600' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="adminTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </button>
        ))}
      </div>

      {status && status.type === 'error' && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-center justify-between border bg-red-50 border-red-200 text-red-700">
          <span>{status.text}</span>
          <button onClick={() => setStatus(null)} className="text-xs font-bold uppercase tracking-wider opacity-60">Dismiss</button>
        </div>
      )}

      {activeTab === 'upload' && (
        <form onSubmit={handleUpload} className="card p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
          {/* Main Attributes Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Unit 3 DBMS Notes" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Period</label>
              <select value={exam} onChange={e => setExam(e.target.value as any)} className="input-field">
                <option value="Mid-1">Mid-1</option>
                <option value="Mid-2">Mid-2</option>
                <option value="SEM">Semester Exam (SEM)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</label>
              <select 
                required 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                className="input-field"
              >
                <option value="">Select Subject</option>
                {['AI', 'ML', 'AFLC', 'ITE', 'WT', 'WT LAB', 'ML LAB', 'Others'].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 pt-4">
            {/* Centered Middle Row */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Unit Number</label>
                <input required value={unit} onChange={e => setUnit(e.target.value)} className="input-field text-center" placeholder="1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Tags</label>
                <input value={tags} onChange={e => setTags(e.target.value)} className="input-field text-center" placeholder="imp, notes" />
              </div>
            </div>

            {/* Deployment Payload (Centered) */}
            <div className="flex flex-col gap-2 w-full max-w-2xl">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Deployment Payload</label>
              <div className="relative group">
                <input 
                  type="file" 
                  required 
                  onChange={e => setFile(e.target.files?.[0] || null)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept=".pdf,image/*" 
                />
                <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${file ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20'}`}>
                  <div className={`p-4 rounded-full mb-4 transition-colors ${file ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Upload size={28} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {file ? file.name : 'Drop file or click to browse'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">PDF or Images (Max 10MB)</p>
                </div>
              </div>
            </div>

            {/* Minimalist Action Button */}
            <div className="w-full max-w-md pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg hover:shadow-blue-500/25 group relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <span className="absolute transition-all duration-500 transform group-hover:-translate-y-10 group-hover:opacity-0">
                      Upload
                    </span>
                    <span className="absolute transition-all duration-500 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 text-blue-50">
                      Deploy
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
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
              onAnimationComplete={() => setTimeout(() => setShowSuccess(false), 2500)}
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
                  Document deployed to repository.
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'manage' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {documents.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{d.title}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{d.exam}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{d.subject}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{d.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteDoc(d.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {documents.length === 0 && <div className="p-12 text-center text-slate-400 italic text-sm">No resources available</div>}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Requested Resource</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Submitter</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{r.title}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{r.subject}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{r.unit}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{r.requestedBy.split('@')[0]}</td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'pending' ? (
                        <button onClick={() => handleFulfillRequest(r.id)} className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">PENDING</button>
                      ) : (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">FULFILLED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && <div className="p-12 text-center text-slate-400 italic text-sm">No active user requests</div>}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="card divide-y divide-slate-100">
          {submissions.map(s => (
            <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-slate-800 truncate">{s.title}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${s.status === 'approved' ? 'bg-green-50 text-green-600' : s.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.subject} • Unit {s.unit} • Contributor: {s.submittedBy}</p>
                <a href={s.fileUrl} target="_blank" className="text-[10px] font-bold text-blue-600 hover:underline mt-1 inline-block">PREVIEW_ASSET</a>
              </div>
              {s.status === 'pending' && (
                <div className="flex gap-2 self-end md:self-auto">
                  <button onClick={() => handleApproveSubmission(s)} className="flex items-center gap-2 px-3 py-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-lg transition-all text-xs font-bold" title="Approve">
                    <Check size={16} /> <span>APPROVE</span>
                  </button>
                  <button onClick={() => updateDoc(doc(db, 'submissions', s.id), { status: 'rejected' })} className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-bold" title="Reject">
                    <X size={16} /> <span>REJECT</span>
                  </button>
                </div>
              )}
            </div>
          ))}
          {submissions.length === 0 && <div className="p-12 text-center text-slate-400 italic text-sm">No pending user contributions</div>}
        </div>
      )}
    </div>
  );
};
