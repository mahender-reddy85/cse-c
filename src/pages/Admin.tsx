import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document, RequestDoc, Submission } from '../types';
import { Plus, Trash2, Edit2, Check, X, Inbox, FileUp, List, MessageSquare, ClipboardCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'requests' | 'submissions'>('upload');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Upload Form
  const [title, setTitle] = useState('');
  const [exam, setExam] = useState<'Mid' | 'Final'>('Mid');
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [tags, setTags] = useState('');
  const [isImportant, setIsImportant] = useState(false);
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
    setLoading(true);
    try {
      const fileRef = ref(storage, `documents/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      
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
        createdAt: serverTimestamp(),
        views: 0,
        isImportant
      });

      setStatus({ type: 'success', text: 'DOCUMENT_DEPLOYED_TO_REPOSITORY' });
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
        exam: 'Mid', // Default
        subject: sub.subject,
        unit: sub.unit,
        tags: ['student-submission'],
        fileUrl: sub.fileUrl,
        fileType: sub.fileUrl.includes('.pdf') ? 'pdf' : 'image', // Basic guess
        uploadedBy: sub.submittedBy,
        createdAt: serverTimestamp(),
        views: 0,
        isImportant: false
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

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: 'upload', label: 'Upload New', icon: FileUp },
          { id: 'manage', label: 'Manage All', icon: List },
          { id: 'requests', label: 'User Requests', icon: MessageSquare },
          { id: 'submissions', label: 'User Submissions', icon: ClipboardCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all relative ${
              activeTab === tab.id 
              ? 'text-brand-600' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="adminTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {status && (
        <div className={`p-4 rounded-lg text-sm font-medium flex items-center justify-between border ${
          status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{status.text}</span>
          <button onClick={() => setStatus(null)} className="text-xs font-bold uppercase tracking-wider opacity-60">Dismiss</button>
        </div>
      )}

      {activeTab === 'upload' && (
        <form onSubmit={handleUpload} className="card p-8 space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Unit 3 DBMS Notes" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Period</label>
              <select value={exam} onChange={e => setExam(e.target.value as any)} className="input-field">
                <option value="Mid">Mid-Semester</option>
                <option value="Final">Final-Semester</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</label>
              <input required value={subject} onChange={e => setSubject(e.target.value)} className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Number</label>
              <input required value={unit} onChange={e => setUnit(e.target.value)} className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keywords (Comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className="input-field" placeholder="imp, revision, notes" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox" 
                id="important" 
                checked={isImportant} 
                onChange={e => setIsImportant(e.target.checked)} 
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-600 border-slate-300" 
              />
              <label htmlFor="important" className="text-sm font-semibold text-slate-700 cursor-pointer">Mark as Critical Resource</label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deployment Payload</label>
            <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all" accept=".pdf,image/*" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Initializing Deployment...' : 'Execute Deployment'}
          </button>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="card divide-y divide-slate-100">
          {documents.map(d => (
            <div key={d.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">{d.title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.subject} • Unit {d.unit} • {d.exam}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDeleteDoc(d.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Resource">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && <div className="p-12 text-center text-slate-400 italic text-sm">No resources available in repository</div>}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="card divide-y divide-slate-100">
          {requests.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-800">{r.title}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${r.status === 'fulfilled' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.subject} • Unit {r.unit} • Submitter: {r.requestedBy}</p>
              </div>
              {r.status === 'pending' && (
                <button onClick={() => handleFulfillRequest(r.id)} className="btn-secondary py-1 text-xs px-3">
                  Check Fulfillment
                </button>
              )}
            </div>
          ))}
          {requests.length === 0 && <div className="p-12 text-center text-slate-400 italic text-sm">No active user requests</div>}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="card divide-y divide-slate-100">
          {submissions.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-800">{s.title}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${s.status === 'approved' ? 'bg-green-50 text-green-600' : s.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.subject} • Unit {s.unit} • Contributor: {s.submittedBy}</p>
                <a href={s.fileUrl} target="_blank" className="text-[10px] font-bold text-brand-600 hover:underline mt-1 inline-block">PREVIEW_ASSET</a>
              </div>
              {s.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApproveSubmission(s)} className="p-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                    <Check size={18} />
                  </button>
                  <button onClick={() => updateDoc(doc(db, 'submissions', s.id), { status: 'rejected' })} className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Reject">
                    <X size={18} />
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
