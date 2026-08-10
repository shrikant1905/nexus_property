import { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, X, ExternalLink, Home, Building2, Landmark, BarChart3, CreditCard } from 'lucide-react';

const initIntegrations = [
  {
    id: 'int1',
    name: 'Airbnb',
    icon: Home,
    iconColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    cardBg: 'bg-[#2a1725] border-pink-500/20',
    status: 'Connected',
    description: 'Import reservations, income, cleaning fees, and taxes automatically',
    tags: ['Reservations', 'Income', 'Cleaning Fees', 'Taxes'],
    lastSync: '2 hours ago',
  },
  {
    id: 'int2',
    name: 'Bank (Chase)',
    icon: Building2,
    iconColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    cardBg: 'bg-[#122436] border-cyan-500/20',
    status: 'Connected',
    description: 'Auto-import deposits, expenses, and transfers',
    tags: ['Deposits', 'Expenses', 'Transfers'],
    lastSync: '30 minutes ago',
  },
  {
    id: 'int3',
    name: 'Bank (Wells Fargo)',
    icon: Landmark,
    iconColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    cardBg: 'bg-[#282119] border-amber-500/20',
    status: 'Connected',
    description: 'Auto-import deposits, expenses, and transfers',
    tags: ['Deposits', 'Expenses', 'Transfers'],
    lastSync: '1 hour ago',
  },
  {
    id: 'int4',
    name: 'QuickBooks',
    icon: BarChart3,
    iconColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    cardBg: 'bg-[#102422] border-emerald-500/20',
    status: 'Disconnected',
    description: 'Two-way sync with QuickBooks accounting data',
    tags: ['Chart of Accounts', 'Journal Entries', 'Reports'],
    lastSync: null,
  },
  {
    id: 'int5',
    name: 'Stripe',
    icon: CreditCard,
    iconColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    cardBg: 'bg-[#1c172d] border-purple-500/20',
    status: 'Disconnected',
    description: 'Process owner payments through Stripe',
    tags: ['Payment Processing', 'Invoicing', 'Subscriptions'],
    lastSync: null,
  },
  {
    id: 'int6',
    name: 'VRBO',
    icon: Home,
    iconColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    cardBg: 'bg-[#122236] border-blue-500/20',
    status: 'Disconnected',
    description: 'Import reservations and income from VRBO listings',
    tags: ['Reservations', 'Income', 'Guest Data'],
    lastSync: null,
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(initIntegrations);

  const toggle = (id) => {
    setIntegrations(integrations.map((i) =>
      i.id === id ? { ...i, status: i.status === 'Connected' ? 'Disconnected' : 'Connected', lastSync: i.status === 'Disconnected' ? 'Just now' : null } : i
    ));
  };

  const connected = integrations.filter((i) => i.status === 'Connected');
  const disconnected = integrations.filter((i) => i.status === 'Disconnected');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-sm text-slate-400 mt-0.5">Connect your platforms and bank accounts</p>
        </div>
      </div>

      {/* Summary Bar (Matching image 4) */}
      <div className="flex items-center gap-6 bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium">
        <span className="flex items-center gap-2 text-emerald-400">
          <Wifi size={16} /> {connected.length} Connected
        </span>
        <div className="w-px h-4 bg-white/10" />
        <span className="flex items-center gap-2 text-slate-400">
          <WifiOff size={16} /> {disconnected.length} Available
        </span>
      </div>

      {/* Grid of 6 Integration Cards (Matching image 4 layout!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {integrations.map((intg) => {
          const isConnected = intg.status === 'Connected';
          const Icon = intg.icon;

          return (
            <div key={intg.id} className={`border rounded-2xl p-6 flex flex-col justify-between ${intg.cardBg}`}>
              <div>
                {/* Header */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${intg.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{intg.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium mt-0.5 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {intg.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mb-4 font-normal leading-relaxed">{intg.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {intg.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] text-slate-300 bg-white/5 border border-white/10 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row */}
              {isConnected ? (
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                  <span>Last sync: {intg.lastSync}</span>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors" title="Sync now">
                      <RefreshCw size={13} />
                    </button>
                    <button onClick={() => toggle(intg.id)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-400 transition-colors" title="Disconnect">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => toggle(intg.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} /> Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
