import React from 'react';
import { X, ExternalLink, Download, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ isOpen, onClose, fileUrl, title }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate uppercase tracking-tight">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                title="Open in New Tab"
              >
                <ExternalLink size={18} />
              </a>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PDF Frame */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-none"
              title={title}
            />
          </div>

          {/* Mobile Footer (Optional) */}
          <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold uppercase tracking-widest"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
