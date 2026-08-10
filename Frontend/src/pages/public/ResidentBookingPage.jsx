import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle2,
  AlertCircle, RefreshCw, XCircle, ChevronRight, ShieldCheck, Loader2
} from 'lucide-react';
import { publicPortalService } from '../../services/publicPortalService';

export default function ResidentBookingPage() {
  const { secureToken } = useParams();

  const [validation, setValidation] = useState(null);
  const [request, setRequest] = useState(null);

  // Booking Flow State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // UI Modes: 'VIEW', 'RESCHEDULE', 'CANCEL'
  const [mode, setMode] = useState('VIEW');
  const [cancelReason, setCancelReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadRequestData = useCallback(async () => {
    try {
      const res = await publicPortalService.getPublicRequestInfo(secureToken);
      if (res.data) {
        setValidation({ valid: true });
        setRequest(res.data);
      } else {
        setValidation({ valid: false, message: 'Invalid or expired booking link.' });
      }
    } catch (err) {
      setValidation({ valid: false, message: err.message || 'Invalid or expired secure token link.' });
    }
  }, [secureToken]);

  // Load and Validate Token
  useEffect(() => {
    loadRequestData();
  }, [loadRequestData]);

  // Re-calculate duration-based slots whenever selectedDate or request changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (secureToken && selectedDate) {
        try {
          const slotsRes = await publicPortalService.getPublicAvailableSlots(secureToken, selectedDate);
          setAvailableSlots(slotsRes.data?.availableSlots || []);
          setSelectedSlot(null);
        } catch (err) {
          setAvailableSlots([]);
        }
      }
    };
    fetchSlots();
  }, [secureToken, selectedDate]);

  // Handle Confirm Booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      const timeSlotStr = typeof selectedSlot === 'string' ? selectedSlot : (selectedSlot.timeSlot || selectedSlot.startTime);
      await publicPortalService.confirmPublicBooking(secureToken, {
        selectedDate,
        selectedTimeSlot: timeSlotStr,
      });

      setActionSuccess('Booking confirmed successfully!');
      await loadRequestData();
      setMode('VIEW');
    } catch (err) {
      alert(err.message || 'Slot no longer available. Please select another slot.');
    }
  };

  // Handle Reschedule Submit
  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;

    try {
      const timeSlotStr = typeof selectedSlot === 'string' ? selectedSlot : (selectedSlot.timeSlot || selectedSlot.startTime);
      await publicPortalService.confirmPublicBooking(secureToken, {
        selectedDate,
        selectedTimeSlot: timeSlotStr,
      });

      setActionSuccess('Appointment rescheduled successfully!');
      await loadRequestData();
      setMode('VIEW');
    } catch (err) {
      alert(err.message || 'Slot unavailable.');
    }
  };

  // Handle Cancel Submit
  const handleConfirmCancel = () => {
    setActionSuccess('Notice sent to management.');
    setMode('VIEW');
  };


  if (!validation) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <p className="text-sm text-slate-400 font-medium">Validating booking link...</p>
      </div>
    );
  }

  // Handle Token States: Invalid, Expired, Revoked
  if (!validation.valid && validation.state === 'INVALID_TOKEN') {
    return <PublicErrorCard title="Invalid Booking Link" message="This booking link does not exist or is invalid. Please contact your property manager for a new link." />;
  }

  if (!validation.valid && validation.state === 'EXPIRED_TOKEN') {
    return <PublicErrorCard title="Booking Link Expired" message="This booking link has expired. Please contact your property manager to receive a new link." />;
  }

  if (!validation.valid && validation.state === 'REVOKED_TOKEN') {
    return <PublicErrorCard title="Link Deactivated" message="This maintenance booking link has been deactivated." />;
  }

  const req = request || validation.request;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 select-none flex flex-col justify-between">
      {/* Mobile-First Header */}
      <header className="bg-[#00204a] border-b border-[#001738] sticky top-0 z-30 px-4 py-3.5 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#00204a] font-black text-xs shadow-xs">
              NEX
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight">Nexus FMS</p>
              <p className="text-sky-200/70 text-[10px] font-medium">Facility Management System • nexusfms.com</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-sky-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            <ShieldCheck size={12} /> Secure Token
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto p-4 flex-1 my-auto">
        <AnimatePresence mode="wait">
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs"
            >
              <span>{actionSuccess}</span>
              <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-slate-900 font-bold">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-5">
          {/* Job Overview Header */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maintenance Job Details</span>
              <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                ⏱ {req.durationHours} Hours Duration
              </span>
            </div>

            <h1 className="text-lg font-black text-[#00204a] leading-snug">{req.description}</h1>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-slate-900">{req.tenantName}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-tight">{req.address}</span>
              </div>
            </div>
          </div>

          {/* STATE A: BOOKED or RESCHEDULED -> Show Summary & Options */}
          {(req.status === 'BOOKED' || req.status === 'RESCHEDULED') && mode === 'VIEW' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Appointment Confirmed
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {req.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-emerald-200 pt-3 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="text-slate-900 font-bold">{req.bookingDetails?.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Time Slot:</span>
                    <span className="text-slate-900 font-bold">{req.bookingDetails?.timeSlot} ({req.durationHours}h)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Staff:</span>
                    <span className="text-[#00204a] font-bold">{req.bookingDetails?.staffName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setMode('RESCHEDULE')}
                  className="py-3 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} /> Reschedule
                </button>
                <button
                  onClick={() => setMode('CANCEL')}
                  className="py-3 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle size={14} /> Cancel Job
                </button>
              </div>
            </div>
          )}

          {/* STATE B: CANCELLED */}
          {req.status === 'CANCELLED' && mode === 'VIEW' && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2">
              <XCircle size={32} className="mx-auto text-red-600" />
              <h2 className="text-base font-black text-red-900">Booking Cancelled</h2>
              <p className="text-xs text-slate-600 font-medium">
                This maintenance job has been cancelled. Contact your property manager to request a new link.
              </p>
            </div>
          )}

          {/* STATE C: WAITING_FOR_BOOKING OR RESCHEDULE MODE -> Render Slot Selector */}
          {(req.status === 'WAITING_FOR_BOOKING' || mode === 'RESCHEDULE') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#00204a] uppercase tracking-wider">
                  {mode === 'RESCHEDULE' ? 'Select New Date & Slot' : 'Select Booking Date'}
                </h3>
                {mode === 'RESCHEDULE' && (
                  <button onClick={() => setMode('VIEW')} className="text-xs text-slate-500 hover:text-slate-800 underline font-bold">
                    Back to Summary
                  </button>
                )}
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={req.earliestDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00204a] focus:bg-white"
                />
              </div>

              {/* Available Duration-Based Slots */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2">
                  Available Slots ({availableSlots.length} found for {req.durationHours}h job)
                </label>

                {availableSlots.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-amber-50 border border-dashed border-amber-200 text-xs text-amber-900 font-medium">
                    <AlertCircle size={20} className="mx-auto mb-1 text-amber-600" />
                    No uninterrupted {req.durationHours}h slots available on {selectedDate}. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {availableSlots.map((slot, i) => {
                      const isSelected = selectedSlot?.timeSlot === slot.timeSlot && selectedSlot?.staffId === slot.staffId;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#00204a] text-white border-[#00204a] shadow-md font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 font-medium'
                          }`}
                        >
                          <p className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{slot.label}</p>
                          <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-sky-200' : 'text-slate-500'}`}>👤 {slot.staffName}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Confirmation Button */}
              {mode === 'RESCHEDULE' ? (
                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmReschedule}
                  className={`w-full py-3.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer ${
                    selectedSlot
                      ? 'bg-[#00204a] hover:bg-[#001738] shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Reschedule
                </button>
              ) : (
                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className={`w-full py-3.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer ${
                    selectedSlot
                      ? 'bg-[#00204a] hover:bg-[#001738] shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Booking Appointment
                </button>
              )}
            </div>
          )}

          {/* STATE D: CANCEL FORM */}
          {mode === 'CANCEL' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-red-900 uppercase tracking-wider">Cancel Maintenance Appointment</h3>
              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to cancel this appointment? Your slot will be released back to the calendar.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for cancellation (Optional)</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Issue resolved / Not at home"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setMode('VIEW')}
                  className="py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-4 px-4 border-t border-slate-200">
        © 2026 Nexus FMS • Facility Management System • nexusfms.com
      </footer>
    </div>
  );
}

// Standalone Public Error Component
function PublicErrorCard({ title, message }) {
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 select-none">
      <div className="max-w-sm w-full bg-[#0e1526] border border-red-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
        <AlertCircle size={40} className="mx-auto text-red-400" />
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
        <div className="pt-2">
          <span className="text-[11px] text-slate-500 font-mono">Nexus FMS Security System</span>
        </div>
      </div>
    </div>
  );
}
