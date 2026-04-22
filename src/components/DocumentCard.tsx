import React from 'react';
import { FileText, Image as ImageIcon, Eye, Download, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { Document } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { PDFPreview } from './PDFPreview';

interface DocumentCardProps {
  doc: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc: docData }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handleView = async () => {
    try {
      await updateDoc(doc(db, 'documents', docData.id), {
        views: increment(1)
      });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error updating views:", error);
      setIsPreviewOpen(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, shadow: "lg" }}
      className="card group relative flex flex-col h-full bg-white transition-all overflow-hidden hover:shadow-xl"
    >
      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${docData.exam === 'mid-1' || docData.exam === 'mid-2' ? 'badge-blue' : 'badge-purple'}`}>
                {docData.exam}
              </span>
              <span className="badge badge-slate">
                {docData.subject}
              </span>
              {docData.isImportant && (
                <span className="badge badge-orange font-bold">CRITICAL</span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
              {docData.title}
            </h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-500 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all duration-200 ml-3">
            {docData.fileType === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Hash size={12} />
            UNIT {docData.unit}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={12} />
            {docData.views}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {docData.tags?.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-slate-50 text-slate-500 rounded-lg font-medium border border-slate-200 uppercase tracking-tight">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 flex items-center gap-3">
        <button 
          onClick={handleView}
          className="btn-secondary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Eye size={16} />
          View
        </button>
        <button 
          onClick={handleView}
          className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Download size={16} />
          Get
        </button>
      </div>
      <PDFPreview 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        fileUrl={docData.fileUrl} 
        title={docData.title} 
      />
    </motion.div>
  );
};
