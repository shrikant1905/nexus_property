import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search...', value, onChange }) {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0f1623] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors min-w-0 sm:min-w-[260px]"
      />
    </div>
  );
}
