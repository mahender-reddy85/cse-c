import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FilterGroupProps {
  label: string;
  icon: LucideIcon;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ label, icon: Icon, value, options, onChange }) => (
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
