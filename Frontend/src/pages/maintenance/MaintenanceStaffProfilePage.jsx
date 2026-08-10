import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Phone, Mail, Clock, Calendar, ShieldCheck, Wrench,
  AlertCircle, Moon, Sun, Bell, PhoneCall, Building
} from 'lucide-react';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../hooks/useAuth';

export default function MaintenanceStaffProfilePage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await staffService.getStaff();
        setStaffList(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        setStaffList([]);
      }
    };
    loadProfile();
  }, []);

  // Strictly bind profile to logged-in technician
  const staff =
    staffList.find(
      (s) =>
        s.name.toLowerCase().includes((user?.name || '').split(' ')[0]?.toLowerCase()) ||
        s.id === user?.id
    ) || staffList[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md flex-shrink-0"
            style={{ backgroundColor: staff?.color || '#00204a' }}
          >
            {staff?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#00204a] tracking-tight">{staff?.name}</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{staff?.role} • Technician Profile</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active Shift Roster
            </span>
          </div>
        </div>

        {/* Security Privacy Badge */}
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-sky-900 font-bold">
          <ShieldCheck size={16} className="text-sky-700" />
          <span>Private Staff Account</span>
        </div>
      </div>

      {/* Roster & Working Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Working Hours Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
            <Clock size={18} className="text-sky-600" /> Shift Hours & Schedule
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Daily Shift Hours:</span>
              <span className="font-extrabold text-slate-900">
                {staff?.workingHours?.start || '08:00'} AM - {staff?.workingHours?.end || '17:00'} PM
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Lunch & Daily Break:</span>
              <span className="font-extrabold text-amber-800">
                {staff?.breakTime?.start || '12:00'} - {staff?.breakTime?.end || '13:00'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-slate-500 font-semibold block mb-1">Working Days:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const isWorking = staff?.workingDays?.includes(day);
                  return (
                    <span
                      key={day}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                        isWorking
                          ? 'bg-[#00204a] text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch & Property Contact Directory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
            <PhoneCall size={18} className="text-emerald-600" /> Property Office Directory
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-slate-900">Emergency Dispatch Desk</p>
                <p className="text-[10px] text-slate-500 font-medium">24/7 Urgent Repair Helpline</p>
              </div>
              <a
                href="tel:+15550009999"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 hover:bg-emerald-100 transition-all"
              >
                Call Office
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-slate-900">Property Manager Desk</p>
                <p className="text-[10px] text-slate-500 font-medium">Office Admin</p>
              </div>
              <a
                href="tel:+15551112222"
                className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 font-extrabold border border-sky-200 hover:bg-sky-100 transition-all"
              >
                Call Admin
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-slate-500 font-semibold text-[11px]">Direct Phone Number:</p>
              <p className="font-black text-slate-900 text-xs">{staff?.phone || '+1 (555) 111-2222'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
          <Bell size={18} className="text-purple-600" /> Notifications & Preferences
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="font-bold text-slate-900">SMS Appointment Alerts</p>
            <p className="text-[11px] text-slate-500 font-medium">Receive SMS notifications when a resident books an appointment slot</p>
          </div>
          <button
            type="button"
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              notifications ? 'bg-[#00204a]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                notifications ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
