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
  const handleView = () => {
    window.open(docData.fileUrl, '_blank');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Force download using Cloudinary's fl_attachment flag
      // We insert 'fl_attachment/' right after '/upload/' in the URL
      const downloadUrl = docData.fileUrl.replace('/upload/', '/upload/fl_attachment/');
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      // Note: download attribute only works for same-origin or with specific headers, 
      // but fl_attachment on Cloudinary side handles the Content-Disposition header.
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download redirection failed:", error);
      window.open(docData.fileUrl, '_blank');
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
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter mb-1">
                {docData.exam}
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {docData.subject}
              </p>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {docData.title}
              </h3>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Hash size={10} className="text-slate-300" />
                UNIT {docData.unit}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {docData.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    #{tag}
                  </span>
                ))}
                {!docData.tags?.length && docData.uploadedBy && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    #{docData.uploadedBy.split('@')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all duration-300 ml-3 shrink-0 border border-slate-100">
            {docData.fileType === 'pdf' ? <FileText size={22} /> : <ImageIcon size={22} />}
          </div>
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
          onClick={handleDownload}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </motion.div>
  );
};
