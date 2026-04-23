import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Document } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { Layers, Book, Hash } from 'lucide-react';

const SUBJECTS = ['AI', 'ML', 'AFLC', 'ITE', 'WT', 'WT LAB', 'ML LAB'];
const EXAMS = ['Mid-1', 'Mid-2', 'SEM'];
const UNITS = ['1', '2', '3', '4', '5'];

export const Browse: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [exam, setExam] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

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
      console.error("Error fetching docs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [exam, subject, unit, authLoading, profile]);

  const ButtonGroup = ({ label, icon: Icon, value, options, onChange }: any) => (
    <div className="flex flex-col gap-1.5 flex-1">
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
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div className="sticky top-20 z-30 card p-4 md:p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-sm flex flex-col md:flex-row flex-wrap gap-4 md:gap-8 items-start">
        <ButtonGroup
          label="Exam"
          icon={Layers}
          value={exam}
          options={EXAMS}
          onChange={setExam}
        />
        <ButtonGroup
          label="Subject"
          icon={Book}
          value={subject}
          options={SUBJECTS}
          onChange={setSubject}
        />
        <ButtonGroup
          label="Unit"
          icon={Hash}
          value={unit}
          options={UNITS}
          onChange={setUnit}
        />
      </div>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
          </div>
        ) : docs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {docs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-24 text-slate-400 bg-white/50 border-dashed border-slate-200">
            <p className="text-sm font-bold uppercase tracking-widest">No matching documents</p>
            <p className="text-xs mt-1">Try adjusting your filters to broaden your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
