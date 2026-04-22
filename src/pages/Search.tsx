import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Document } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { Search as SearchIcon, Terminal, X } from 'lucide-react';

export const Search: React.FC = () => {
  const location = useLocation();
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [location.search]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'documents'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Document));
      setAllDocs(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocs([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allDocs.filter(doc => 
      doc.title.toLowerCase().includes(term) || 
      doc.subject.toLowerCase().includes(term) ||
      doc.tags.some(tag => tag.toLowerCase().includes(term))
    );
    setFilteredDocs(filtered);
  }, [searchTerm, allDocs]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Global Search
        </h1>
        <p className="text-xs text-slate-500 font-medium">Search the repository by title, subject, or keywords</p>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for documents, subjects, or tags..."
          className="input-field pl-12 py-4 text-base shadow-sm"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div>
        {searchTerm ? (
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-700">
                Matching Resources ({filteredDocs.length})
              </h2>
            </div>
            {filteredDocs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 px-6 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 shadow-inner">
                  <SearchIcon size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matches found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mt-1 leading-relaxed">
                  We couldn't find anything for "{searchTerm}". Try checking your spelling or use different keywords.
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 opacity-20 select-none">
            <SearchIcon size={80} className="mb-4 text-slate-300" />
            <p className="font-bold text-sm uppercase tracking-widest text-slate-400">
              Enter Search Criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
