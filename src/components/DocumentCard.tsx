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
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {docData.exam}
              </span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {docData.subject}
              </span>
            </div>
            
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
              {docData.title}
            </h3>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="font-medium">Unit {docData.unit}</span>
              {docData.tags?.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-1.5">
                    {docData.tags.map(tag => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-slate-300 dark:text-slate-600 shrink-0">
            {docData.fileType === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
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
