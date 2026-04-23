import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { Clock, Layers, Book, Hash } from 'lucide-react';

const SUBJECTS = ['AI', 'ML', 'AFLC', 'ITE', 'WT', 'WT LAB', 'ML LAB'];
const EXAMS = ['Mid-1', 'Mid-2', 'SEM'];
const UNITS = ['1', '2', '3', '4', '5'];

export const Dashboard: React.FC = () => {
  const { profile, loading: authLoading, isAdmin } = useAuth();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [exam, setExam] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  useEffect(() => {
    const fetchRecent = async () => {
      if (authLoading || !profile || isAdmin) return; // Hide for admins
      try {
        const qRecent = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(5));
        const snapRecent = await getDocs(qRecent);
        setRecentDocs(snapRecent.docs.map(d => ({ id: d.id, ...d.data() } as Document)));
      } catch (error) {
        console.error("Error fetching recent docs:", error);
      }
    };
    fetchRecent();
  }, [authLoading, profile, isAdmin]);

  const fetchDocs = async () => {
    if (authLoading || !profile) return;
    setLoading(true);
    try {
      let q = query(collection(db, 'documents'));
      if (exam) q = query(q, where('exam', '==', exam));
      if (subject) q = query(q, where('subject', '==', subject));
      if (unit) q = query(q, where('unit', '==', unit));

      const snap = await getDocs(q);
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Document)));
    } catch (error) {
      console.error("Error fetching explorer docs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [exam, subject, unit, authLoading, profile]);

  const handleRowClick = (docData: Document) => {
    window.open(docData.fileUrl, '_blank');
  };

  const ButtonGroup = ({ label, icon: Icon, value, options, onChange }: any) => (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <Icon size={12} />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${value === opt
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading && docs.length === 0) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. Explorer Filters (Sticky) */}
      <div className="sticky top-20 z-30 card p-4 md:p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm flex flex-col md:flex-row flex-wrap gap-4 md:gap-8 items-start border border-slate-200 dark:border-slate-800">
        <ButtonGroup label="Exam" icon={Layers} value={exam} options={EXAMS} onChange={setExam} />
        <ButtonGroup label="Subject" icon={Book} value={subject} options={SUBJECTS} onChange={setSubject} />
        <ButtonGroup label="Unit" icon={Hash} value={unit} options={UNITS} onChange={setUnit} />
      </div>

      {/* 2. Recently Added (Hidden for Admins) */}
      {!isAdmin && recentDocs.length > 0 && (
        <section className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              Recently Added
            </h3>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Exam</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {recentDocs.map(doc => (
                    <tr key={doc.id} onClick={() => handleRowClick(doc)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">{doc.title}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{doc.exam}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{doc.subject}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{doc.unit}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">OPEN</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 3. Explorer Content */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
            <Layers className="w-5 h-5 text-blue-600" />
            Resources
          </h3>
        </div>
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {docs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-24 text-slate-400 bg-white/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold uppercase tracking-widest">No matching documents</p>
            <p className="text-xs mt-1">Try adjusting your filters to broaden your search.</p>
          </div>
        )}
      </section>
    </div>
  );
};
