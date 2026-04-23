import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document } from '../types';
import { Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !profile) return;
      try {
        const qRecent = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(5));
        const snapRecent = await getDocs(qRecent);
        setRecentDocs(snapRecent.docs.map(d => ({ id: d.id, ...d.data() } as Document)));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, profile]);

  const handleRowClick = (docData: Document) => {
    window.open(docData.fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
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
                  <tr 
                    key={doc.id} 
                    onClick={() => handleRowClick(doc)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
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
          {/* Mobile Fallback (Hidden on md, but shown if needed) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {recentDocs.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => handleRowClick(doc)}
                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="space-y-1.5 overflow-hidden pr-4">
                  <span className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 uppercase tracking-tighter">
                    {doc.exam}
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{doc.title}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest truncate">
                    {doc.subject} • UNIT {doc.unit}
                  </p>
                </div>
                <div className="shrink-0">
                   <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 uppercase">OPEN</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
