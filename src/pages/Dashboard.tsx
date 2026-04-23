import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { Layers, Book, Hash, Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = ['AI', 'ML', 'AFLC', 'ITE', 'WT', 'WT LAB', 'ML LAB'];
const EXAMS = ['Mid-1', 'Mid-2', 'SEM'];
const UNITS = ['1', '2', '3', '4', '5'];

export const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [exam, setExam] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Live Search logic for mobile search bar
  useEffect(() => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`, { replace: true });
    }
  }, [searchTerm]);

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
        
        {/* Mobile-only Search Bar (moved from header) */}
        <div className="lg:hidden w-full mb-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <SearchIcon size={16} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..." 
              className="w-full bg-slate-50 border-2 border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800 mt-4 -mx-4 md:-mx-6" />
        </div>

        <ButtonGroup label="Exam" icon={Layers} value={exam} options={EXAMS} onChange={setExam} />
        <ButtonGroup label="Subject" icon={Book} value={subject} options={SUBJECTS} onChange={setSubject} />
        <ButtonGroup label="Unit" icon={Hash} value={unit} options={UNITS} onChange={setUnit} />
      </div>

      {/* 2. Resources Grid */}
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
