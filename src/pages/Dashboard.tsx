import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { Flame, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [importantDocs, setImportantDocs] = useState<Document[]>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [mostViewedDocs, setMostViewedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to be ready and profile to exist before fetching
      if (authLoading || !profile) return;
      
      try {
        const docsRef = collection(db, 'documents');

        // Fetch Important
        const qImportant = query(docsRef, where('isImportant', '==', true), limit(4));
        const snapImportant = await getDocs(qImportant);
        setImportantDocs(snapImportant.docs.map(d => ({ id: d.id, ...d.data() } as Document)));

        // Fetch Recent
        const qRecent = query(docsRef, orderBy('createdAt', 'desc'), limit(4));
        const snapRecent = await getDocs(qRecent);
        setRecentDocs(snapRecent.docs.map(d => ({ id: d.id, ...d.data() } as Document)));

        // Fetch Most Viewed
        const qMostViewed = query(docsRef, orderBy('views', 'desc'), limit(4));
        const snapMostViewed = await getDocs(qMostViewed);
        setMostViewedDocs(snapMostViewed.docs.map(d => ({ id: d.id, ...d.data() } as Document)));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, profile]);

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

  const Section = ({ title, icon: Icon, docs, badgeClass }: { title: string; icon: any; docs: Document[]; badgeClass: string }) => (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-surface-900 flex items-center gap-3">
          <Icon className="w-5 h-5 text-brand-600" />
          {title}
        </h3>
        <a href="/browse" className="text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors">View All</a>
      </div>
      {docs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {docs.map(doc => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 text-surface-400 bg-gradient-to-br from-surface-50 to-white border-dashed border-surface-300">
          <AlertTriangle size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-semibold uppercase tracking-wide">No Data Available</p>
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <p className="text-xs font-bold text-surface-500 uppercase mb-2 tracking-wider">Active Resources</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-surface-900">{recentDocs.length + importantDocs.length}</p>
            <span className="text-sm text-success font-semibold">+4 this week</span>
          </div>
        </div>
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <p className="text-xs font-bold text-surface-500 uppercase mb-2 tracking-wider">Most Viewed</p>
          <p className="text-3xl font-bold text-brand-600">{mostViewedDocs[0]?.views || 0}</p>
        </div>
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-500 to-brand-700 p-6 rounded-2xl flex items-center justify-between text-white shadow-xl">
          <div>
            <p className="text-xs font-bold opacity-80 uppercase mb-2 tracking-wider">Quick Filter</p>
            <p className="text-xl font-bold tracking-tight">Access Final Exam Resources</p>
          </div>
          <button 
            onClick={() => window.location.href = '/browse'}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-bold transition-all duration-200 backdrop-blur-sm"
          >
            GO_TO_EXPLORER
          </button>
        </div>
      </div>

      <Section 
        title="Important Resources" 
        icon={Flame} 
        docs={importantDocs} 
        badgeClass="badge-orange" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-600" />
              Recently Added
            </h3>
          </div>
          <div className="card overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-50 dark:bg-slate-700/50 text-xs font-bold text-surface-500 uppercase border-b border-surface-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentDocs.map(doc => (
                    <tr key={doc.id} className="border-b border-surface-100 dark:border-slate-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-semibold text-surface-800 dark:text-slate-200 truncate max-w-[200px]">{doc.title}</td>
                      <td className="px-6 py-4 text-surface-600 dark:text-slate-400">{doc.subject}</td>
                      <td className="px-6 py-4 font-mono text-surface-500 dark:text-slate-500 text-right">{doc.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile List View */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
              {recentDocs.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="overflow-hidden mr-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{doc.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{doc.subject}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-brand-600">{doc.views}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Trending Now
            </h3>
          </div>
          <div className="space-y-4">
            {mostViewedDocs.slice(0, 3).map(doc => (
              <div key={doc.id} className="card p-5 flex items-center justify-between hover:border-brand-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">{doc.title}</p>
                    <p className="text-xs text-surface-500">{doc.subject} • {doc.exam}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600">{doc.views}</p>
                  <p className="text-xs text-surface-500 uppercase font-semibold tracking-tight">Views</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
