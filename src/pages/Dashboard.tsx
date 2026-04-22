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
        <div className="h-32 bg-white/5 cyber-border"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white/5 cyber-border"></div>)}
        </div>
      </div>
    );
  }

  const Section = ({ title, icon: Icon, docs, badgeClass }: { title: string; icon: any; docs: Document[]; badgeClass: string }) => (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-600" />
          {title}
        </h3>
        <a href="/browse" className="text-xs text-brand-600 font-medium hover:underline">View All</a>
      </div>
      {docs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {docs.map(doc => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-12 text-slate-400 bg-white/50 border-dashed border-slate-200">
          <AlertTriangle size={32} className="mb-2 opacity-20" />
          <p className="text-[10px] font-semibold uppercase tracking-wider">No Data Available</p>
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Active Resources</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800">{recentDocs.length + importantDocs.length}</p>
            <span className="text-[10px] text-green-500 font-bold">+4 this week</span>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Most Viewed</p>
          <p className="text-2xl font-bold text-brand-600">{mostViewedDocs[0]?.views || 0}</p>
        </div>
        <div className="lg:col-span-2 bg-brand-600 p-5 rounded-xl flex items-center justify-between text-white shadow-lg shadow-brand-600/20">
          <div>
            <p className="text-[10px] font-bold opacity-80 uppercase mb-1 tracking-wider">Quick Filter</p>
            <p className="text-lg font-bold tracking-tight">Access Final Exam Resources</p>
          </div>
          <button 
            onClick={() => window.location.href = '/browse'}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition-colors"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Recently Added
            </h3>
          </div>
          <div className="card">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {recentDocs.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors pointer-default">
                    <td className="px-4 py-3 font-semibold text-slate-700 truncate max-w-[150px]">{doc.title}</td>
                    <td className="px-4 py-3 text-slate-500">{doc.subject}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-right">{doc.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Trending Now
            </h3>
          </div>
          <div className="space-y-3">
            {mostViewedDocs.slice(0, 3).map(doc => (
              <div key={doc.id} className="card p-4 flex items-center justify-between hover:border-brand-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{doc.title}</p>
                    <p className="text-[10px] text-slate-400">{doc.subject} • {doc.exam}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-600">{doc.views}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Views</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
