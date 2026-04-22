import React from 'react';
import { FileText, Image as ImageIcon, Eye, Download, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { Document } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface DocumentCardProps {
  doc: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc: docData }) => {
  const handleView = async () => {
    try {
      await updateDoc(doc(db, 'documents', docData.id), {
        views: increment(1)
      });
      window.open(docData.fileUrl, '_blank');
    } catch (error) {
      console.error("Error updating views:", error);
      window.open(docData.fileUrl, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="card group relative flex flex-col h-full bg-white transition-all overflow-hidden"
    >
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1.5">
              <span className={`badge ${docData.exam === 'Mid' ? 'badge-blue' : 'badge-purple'}`}>
                {docData.exam}
              </span>
              <span className="badge badge-slate">
                {docData.subject}
              </span>
              {docData.isImportant && (
                <span className="badge badge-orange font-bold">CRITICAL</span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
              {docData.title}
            </h3>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-brand-600 transition-colors">
            {docData.fileType === 'pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            UNIT {docData.unit}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {docData.views}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {docData.tags?.map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md font-medium border border-slate-100 uppercase tracking-tighter">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
        <button 
          onClick={handleView}
          className="btn-secondary flex-1 py-1.5 flex items-center justify-center gap-2 text-xs"
        >
          <Eye size={14} />
          View
        </button>
        <a 
          href={docData.fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1 py-1.5 flex items-center justify-center gap-2 text-xs"
        >
          <Download size={14} />
          Get
        </a>
      </div>
    </motion.div>
  );
};
