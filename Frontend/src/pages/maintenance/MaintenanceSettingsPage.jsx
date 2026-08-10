import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Phone, Mail, Clock, Calendar, Shield, Bell,
  Save, Check, Sparkles, MessageSquare, Sliders, Globe, RefreshCw, Key
} from 'lucide-react';
import { slideInBottom, staggerContainer, staggerItem } from '../../utils/motionVariants';

export default function MaintenanceSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Nexus FMS Ltd.',
    tagline: 'Facility Management System • nexusfms.com',
    supportPhone: '0121 769 1767',
    supportEmail: 'Info@nexusfms.com',
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    defaultDuration: '1.5',
    autoExpiryDays: '7',
    smsEnabled: true,
    emailEnabled: true,
    autoAssignStaff: false,
    requirePhotoUpload: true,
    reminderHoursBefore: '24',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00204a] tracking-tight leading-tight">
            System Settings & Preferences
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
            Manage company branding, resident booking defaults, notifications, and technician rules
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          type="button"
          className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex-shrink-0"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Settings Saved!' : 'Save All Changes'}</span>
        </motion.button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Check size={20} className="text-emerald-600" />
            <span>All system configurations and resident link defaults have been updated successfully.</span>
          </div>
          <button onClick={() => setSaved(false)} className="text-emerald-700 hover:text-slate-900 font-black">✕</button>
        </motion.div>
      )}

      {/* Main Settings Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left 2 Columns: Main Settings Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Company & Support Branding */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 text-[#00204a] flex items-center justify-center font-black">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#00204a]">Company Profile & Branding</h2>
                <p className="text-xs text-slate-500 font-medium">Identity shown on resident SMS and Email portal invitations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Company Name</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">System Tagline</label>
                <div className="relative">
                  <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Support Helpline Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Support Contact Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Booking Engine & Duration Rules */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black">
                <Clock size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#00204a]">Resident Booking Rules & Shift Defaults</h2>
                <p className="text-xs text-slate-500 font-medium">Slot calculation defaults and link expiration policies</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Default Job Duration</label>
                <select
                  value={settings.defaultDuration}
                  onChange={(e) => setSettings({ ...settings, defaultDuration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a] cursor-pointer"
                >
                  <option value="0.5">30 Minutes (0.5h)</option>
                  <option value="1.0">1.0 Hour</option>
                  <option value="1.5">1.5 Hours (Recommended)</option>
                  <option value="2.0">2.0 Hours</option>
                  <option value="3.0">3.0 Hours</option>
                  <option value="4.0">4.0 Hours (Half Day)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Default estimated duration pre-selected in link generator</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Booking Link Expiry Period</label>
                <select
                  value={settings.autoExpiryDays}
                  onChange={(e) => setSettings({ ...settings, autoExpiryDays: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a] cursor-pointer"
                >
                  <option value="1">1 Day (Urgent Jobs)</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days (Default Standard)</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                </select>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Links auto-deactivate after this timeframe</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Technician Daily Shift Starts</label>
                <input
                  type="time"
                  value={settings.businessHoursStart}
                  onChange={(e) => setSettings({ ...settings, businessHoursStart: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Technician Daily Shift Ends</label>
                <input
                  type="time"
                  value={settings.businessHoursEnd}
                  onChange={(e) => setSettings({ ...settings, businessHoursEnd: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#00204a]"
                />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Automation & Notification Toggles */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-black">
                <Bell size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#00204a]">Notifications & Automated Alerts</h2>
                <p className="text-xs text-slate-500 font-medium">Control automated SMS/Email dispatch behavior</p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {/* Toggle 1 */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">SMS Notifications Gateway</p>
                  <p className="text-xs text-slate-500">Send text messages with booking and quote links directly to resident mobile</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('smsEnabled')}
                  className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                    settings.smsEnabled ? 'bg-[#00204a]' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.smsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Email Confirmations & Reminders</p>
                  <p className="text-xs text-slate-500">Send confirmation receipts and calendar invitations to resident email address</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('emailEnabled')}
                  className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                    settings.emailEnabled ? 'bg-[#00204a]' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.emailEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Mandatory Photo Proof for Quotes</p>
                  <p className="text-xs text-slate-500">Require residents to attach at least 1 photo when submitting quote requests</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('requirePhotoUpload')}
                  className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                    settings.requirePhotoUpload ? 'bg-[#00204a]' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.requirePhotoUpload ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right 1 Column: System Information & Status Sidebar */}
        <div className="space-y-6">
          
          {/* Card: Live Portal Preview Card */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-[#00204a] flex items-center gap-2">
              <Sparkles size={18} className="text-sky-600" /> Live Resident Card Preview
            </h3>
            <p className="text-xs text-slate-500">Preview how your company header will appear on public booking links:</p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00204a] flex items-center justify-center text-white font-black text-base shadow-xs">
                  N
                </div>
                <div>
                  <p className="text-sm font-black text-[#00204a]">{settings.companyName}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{settings.tagline}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-700">
                <p>📞 Support: <span className="text-slate-900 font-bold">{settings.supportPhone}</span></p>
                <p>✉️ Email: <span className="text-sky-800 font-bold">{settings.supportEmail}</span></p>
              </div>
            </div>
          </motion.div>

          {/* Card: System Health & Capacity */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-[#00204a] flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" /> Nexus FMS System Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Technicians Active</span>
                <span className="font-extrabold text-emerald-800">4 Staff Members</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Daily Job Target</span>
                <span className="font-extrabold text-sky-800">~20 Jobs / Day</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Asana Pipeline Sync</span>
                <span className="font-extrabold text-amber-800">5 Active Columns</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Token Security</span>
                <span className="font-extrabold text-purple-800">Crypto UUID Active</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

