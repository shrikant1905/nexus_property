// Reusable form field components

export function FormField({ label, name, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor={name}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white focus:ring-1 focus:ring-[#00204a]/30 transition-colors"
      />
    </div>
  );
}

export function SelectField({ label, name, options, value, onChange, required, placeholder = 'Select...' }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor={name}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00204a] focus:bg-white focus:ring-1 focus:ring-[#00204a]/30 transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-xs font-bold text-slate-800">{label}</p>
        {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-[#00204a]' : 'bg-slate-300'
        }`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
          style={{ width: '18px', height: '18px' }}
        />
      </button>
    </div>
  );
}
