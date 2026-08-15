import { useState } from 'react';
import { ToggleField } from '../../../components/forms/FormFields';

const tabs = ['General', 'Billing', 'Notifications', 'Security'];

const notifToggles = [
  { key: 'newTx', label: 'New transaction imported', desc: 'Get notified when new bank transactions are imported' },
  { key: 'expenseAssign', label: 'Expense needs assignment', desc: 'Alert when an expense is unassigned to a property' },
  { key: 'invoiceGen', label: 'Invoice generated', desc: 'Notification when an invoice is created' },
  { key: 'paymentRec', label: 'Payment received', desc: 'Alert when an owner payment is received' },
  { key: 'paymentUnmatched', label: 'Payment unmatched', desc: 'Alert when a payment cannot be matched to an invoice' },
  { key: 'portalLogin', label: 'Owner portal login', desc: 'Notify when an owner logs into the portal' },
  { key: 'weeklySummary', label: 'Weekly summary', desc: 'Receive a weekly financial summary email' },
];

const securityToggles = [
  { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all user logins' },
  { key: 'sessionTimeout', label: 'Session Timeout', desc: 'Automatically log out inactive sessions' },
  { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all user actions for compliance' },
  { key: 'dataEncryption', label: 'Data Encryption', desc: 'Encrypt sensitive data at rest' },
  { key: 'ipWhitelisting', label: 'IP Whitelisting', desc: 'Restrict access to approved IP addresses' },
];

const activityHistory = [
  { user: 'Alex Rivera', action: 'Logged in', time: '2026-03-06 09:30 AM' },
  { user: 'Maria Santos', action: 'Generated invoice INV-001', time: '2026-03-06 08:45 AM' },
  { user: 'James Park', action: 'Added reservation', time: '2026-03-05 04:45 PM' },
  { user: 'Alex Rivera', action: 'Updated settings', time: '2026-03-05 02:10 PM' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [notifs, setNotifs] = useState({ newTx: true, expenseAssign: true, invoiceGen: true, paymentRec: true, paymentUnmatched: true, portalLogin: false, weeklySummary: true });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: true, auditLogging: true, dataEncryption: true, ipWhitelisting: false });
  const [general, setGeneral] = useState({ companyName: 'Relaxtay Property Management', managementFee: '20', feeBasis: 'Gross Revenue', invoicePrefix: 'INV-', paymentTerms: 'Net 15' });

  const genChange = (e) => setGeneral({ ...general, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">System configuration and preferences</p>
      </div>

      {/* Tab Bar matching Screenshot 1 */}
      <div className="flex items-center gap-1 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px cursor-pointer ${
              activeTab === tab
                ? 'border-[#009bf2] text-[#38bdf8]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General Tab matching Screenshot 1 */}
      {activeTab === 'General' && (
        <div className="max-w-xl">
          <div className="bg-[#0e1526] border border-white/5 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-2">Company Settings</h3>
            {[
              { label: 'Company Name', name: 'companyName', placeholder: 'Company name' },
              { label: 'Default Management Fee (%)', name: 'managementFee', placeholder: '20' },
              { label: 'Fee Calculation Basis', name: 'feeBasis', placeholder: 'Gross Revenue' },
              { label: 'Invoice Prefix', name: 'invoicePrefix', placeholder: 'INV-' },
              { label: 'Default Payment Terms', name: 'paymentTerms', placeholder: 'Net 15' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{f.label}</label>
                <input
                  name={f.name}
                  value={general[f.name]}
                  onChange={genChange}
                  placeholder={f.placeholder}
                  className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009bf2]/40 focus:border-[#009bf2]/40 transition-colors"
                />
              </div>
            ))}
            <div className="pt-2">
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'Billing' && (
        <div className="max-w-xl space-y-4">
          <div className="bg-[#0e1526] border border-white/5 rounded-2xl p-6">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Current Plan</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-white">Professional</p>
                <p className="text-sm text-slate-400 mt-0.5">$99/mo · Up to 25 properties</p>
              </div>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-[#38bdf8] border border-[#009bf2]/30 hover:bg-[#009bf2]/10 transition-colors cursor-pointer">
                Upgrade
              </button>
            </div>
          </div>
          <div className="bg-[#0e1526] border border-white/5 rounded-2xl p-6">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Payment Method</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Visa ending in ****4242</p>
              <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/10 hover:text-white hover:border-white/20 transition-colors cursor-pointer">
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'Notifications' && (
        <div className="max-w-xl bg-[#0e1526] border border-white/5 rounded-2xl px-6 divide-y divide-white/5">
          {notifToggles.map((t) => (
            <ToggleField
              key={t.key}
              label={t.label}
              description={t.desc}
              checked={notifs[t.key]}
              onChange={(v) => setNotifs({ ...notifs, [t.key]: v })}
            />
          ))}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div className="max-w-xl space-y-4">
          <div className="bg-[#0e1526] border border-white/5 rounded-2xl px-6 divide-y divide-white/5">
            {securityToggles.map((t) => (
              <ToggleField
                key={t.key}
                label={t.label}
                description={t.desc}
                checked={security[t.key]}
                onChange={(v) => setSecurity({ ...security, [t.key]: v })}
              />
            ))}
          </div>
          <div className="bg-[#0e1526] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Activity History</h3>
            <div className="space-y-3">
              {activityHistory.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <span className="text-slate-300">
                    <span className="font-semibold text-white">{a.user}</span>
                    <span className="text-slate-500 mx-1.5">—</span>
                    {a.action}
                  </span>
                  <span className="text-slate-500 whitespace-nowrap ml-4">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
