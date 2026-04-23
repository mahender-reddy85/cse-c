import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { Flame, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { profile, loading: authLoading, isAdmin } = useAuth();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to be ready and profile to exist before fetching
      if (authLoading || !profile) return;
      
      try {
        const docsRef = collection(db, 'documents');



        // Fetch Recent
        const qRecent = query(docsRef, orderBy('createdAt', 'desc'), limit(4));
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
        <div className="h-40 bg-surface-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-56 bg-surface-100 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-12">




      <div className="grid grid-cols-1 gap-10">
        <section className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-600" />
              Recently Added
            </h3>
          </div>
          <div className="card overflow-hidden shadow-sm">
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-50 dark:bg-slate-700/50 text-xs font-bold text-surface-500 uppercase border-b border-surface-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentDocs.map(doc => (
                    <tr 
                      key={doc.id} 
                      onClick={() => handleRowClick(doc)}
                      className="border-b border-surface-100 dark:border-slate-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-semibold text-surface-800 dark:text-slate-200 truncate max-w-[200px] group-hover:text-brand-600 transition-colors">{doc.title}</td>
                      <td className="px-6 py-4 text-surface-600 dark:text-slate-400">{doc.subject}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">OPEN</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile List View */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
              {recentDocs.map(doc => (
                <div 
                  key={doc.id} 
                  onClick={() => handleRowClick(doc)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer active:bg-slate-100"
                >
                  <div className="overflow-hidden mr-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{doc.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{doc.subject}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">OPEN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
