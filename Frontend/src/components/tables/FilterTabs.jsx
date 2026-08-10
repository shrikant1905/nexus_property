export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={
            active === tab
              ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all'
              : 'px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all'
          }
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
