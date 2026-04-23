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
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border ${docData.exam?.toLowerCase().includes('mid') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                {docData.exam}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter bg-slate-100 text-slate-700 border border-slate-200">
                {docData.subject}
              </span>
              {docData.isImportant && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter bg-orange-500 text-white border border-orange-600">CRITICAL</span>
              )}
            </div>
            
            <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
              {docData.title}
            </h3>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                <Hash size={12} className="text-brand-600" />
                UNIT {docData.unit}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {docData.tags?.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter hover:text-brand-500 transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
              {/* If no tags, show uploader as a fallback tag style */}
              {!docData.tags?.length && docData.uploadedBy && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  #{docData.uploadedBy.split('@')[0]}
                </span>
              )}
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
