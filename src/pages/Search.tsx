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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
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
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Found {filteredDocs.length} matching resources
              </h2>
            </div>
            {filteredDocs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                  <SearchIcon size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No results found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                  We couldn't find any documents matching "{searchTerm}".
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 opacity-30 select-none">
            <SearchIcon size={64} className="mb-6 text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400">
              Enter keywords to search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
