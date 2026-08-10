import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Filter, User, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, MapPin, Eye, Search, Sparkles } from 'lucide-react';
import { calendarService } from '../../services/calendarService';
import { staffService } from '../../services/staffService';
import { jobService } from '../../services/jobService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import FormModal from '../../components/modals/FormModal';
import { slideInBottom } from '../../utils/motionVariants';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MaintenanceCalendarPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Navigation State (Defaults to August 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 6)); // Default Aug 6, 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-06'); // Selected Date for Right Panel

  // Detect if logged-in user is strictly a Technician/Staff (and NOT an Office Admin)
  const isTechnician =
    user?.roleKey === 'maintenance-staff' ||
    user?.roleKey === 'operations-staff' ||
    (user?.role === 'STAFF' && user?.roleKey !== 'office-admin');

  // If user is a technician, bind to their active staff profile
  const activeStaff = isTechnician
    ? staffList.find(
        (s) =>
          s.name.toLowerCase().includes((user?.name || '').split(' ')[0]?.toLowerCase()) ||
          s.id === user?.id
      ) || staffList[0]
    : null;

  // View mode: 'monthly' | 'weekly' | 'daily'
  const [viewMode, setViewMode] = useState('monthly');

  // Selected staff filter
  const [selectedStaffId, setSelectedStaffId] = useState(() => (isTechnician && activeStaff ? activeStaff.id : 'ALL'));

  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load API Data
  const loadCalendarApiData = async () => {
    try {
      const [calRes, staffRes, jobsRes] = await Promise.all([
        calendarService.getCalendar({ staffId: selectedStaffId !== 'ALL' ? selectedStaffId : undefined }).catch(() => null),
        staffService.getStaff().catch(() => []),
        jobService.getJobs().catch(() => []),
      ]);
      const staffData = calRes?.staff || (Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
      const allJobs = Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || [];
      setStaffList(staffData);
      setJobs(allJobs);
    } catch (err) {
      setStaffList([]);
      setJobs([]);
    }
  };

  useEffect(() => {
    loadCalendarApiData();
  }, [selectedStaffId]);

  const filteredStaff = isTechnician && activeStaff
    ? [activeStaff]
    : selectedStaffId === 'ALL'
    ? staffList
    : staffList.filter((s) => s.id === selectedStaffId);

  // Date Navigation Controls (Prev / Next)
  const handlePrev = () => {
    if (viewMode === 'monthly') {
      const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(prev);
    } else if (viewMode === 'weekly') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const handleNext = () => {
    if (viewMode === 'monthly') {
      const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(next);
    } else if (viewMode === 'weekly') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 6)); // Reset to Aug 6, 2026
    setSelectedDateStr('2026-08-06');
  };

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute Days for Monthly Calendar Grid
  const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  // Helper to fetch all active confirmed bookings for a technician
  const getBookingsForStaff = (staffId) => {
    const list = [];

    // 1. From booking requests store
    bookingRequests.forEach((req) => {
      if (
        (req.status === 'BOOKED' || req.status === 'RESCHEDULED') &&
        req.bookingDetails &&
        (req.bookingDetails.staffId === staffId || req.assignedStaffId === staffId)
      ) {
        list.push({
          id: req.id,
          title: req.description,
          tenantName: req.tenantName,
          address: req.address || 'Property Address',
          date: req.bookingDetails.date,
          timeSlot: req.bookingDetails.timeSlot,
          duration: req.durationHours,
          status: req.status,
          staffId: req.bookingDetails.staffId || req.assignedStaffId,
        });
      }
    });

    // 2. From jobs store
    jobs.forEach((j) => {
      if (j.assignedStaffId === staffId && j.scheduledDate && j.scheduledTimeSlot) {
        const exists = list.some((item) => item.title === j.title && item.date === j.scheduledDate);
        if (!exists) {
          list.push({
            id: j.id,
            title: j.title,
            tenantName: j.tenantName,
            address: j.address || 'Property Address',
            date: j.scheduledDate,
            timeSlot: j.scheduledTimeSlot,
            duration: j.durationHours || 1.5,
            status: 'BOOKED',
            staffId: j.assignedStaffId,
          });
        }
      }
    });

    return list;
  };

  // Helper to get all bookings for the entire filtered staff list on a given YYYY-MM-DD date
  const getDayBookings = (dateStr) => {
    const allBookings = [];
    filteredStaff.forEach((staff) => {
      const bList = getBookingsForStaff(staff.id);
      bList.forEach((b) => {
        if (b.date === dateStr) {
          allBookings.push({ ...b, staffName: staff.name, staffColor: staff.color, staffRole: staff.role });
        }
      });
    });
    return allBookings;
  };

  // All bookings for description directory table
  const allFilteredBookings = [];
  filteredStaff.forEach((staff) => {
    const bList = getBookingsForStaff(staff.id);
    bList.forEach((b) => {
      allFilteredBookings.push({ ...b, staffName: staff.name, staffColor: staff.color, staffRole: staff.role });
    });
  });

  const searchedBookings = allFilteredBookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.tenantName.toLowerCase().includes(q) ||
      b.staffName?.toLowerCase().includes(q) ||
      b.date.includes(q)
    );
  });

  // Calculate Week Days for Weekly View
  const getWeekDays = (baseDate) => {
    const curr = new Date(baseDate);
    const first = curr.getDate() - curr.getDay() + 1; // Mon
    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.getFullYear(), curr.getMonth(), first + i);
      const formattedDay = next.getDate() < 10 ? `0${next.getDate()}` : `${next.getDate()}`;
      const formattedMonth = next.getMonth() + 1 < 10 ? `0${next.getMonth() + 1}` : `${next.getMonth() + 1}`;
      const dateStr = `${next.getFullYear()}-${formattedMonth}-${formattedDay}`;
      days.push({
        dateStr,
        dayNum: next.getDate(),
        dayCode: WEEKDAYS[next.getDay()],
        fullDate: next.toLocaleString('default', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  // Selected Date Bookings for Right Details Panel
  const selectedDateBookings = getDayBookings(selectedDateStr);

  const formatSelectedDateTitle = (dateStr) => {
    if (!dateStr) return 'Selected Date';
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* PROPERLY ALIGNED HEADER & NAVBAR CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-xl font-black text-[#00204a] tracking-tight flex items-center gap-2">
              <CalendarIcon className="text-sky-600" size={22} />
              {isTechnician && activeStaff ? `Shift Calendar — ${activeStaff.name}` : 'Maintenance Work Order Calendar'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isTechnician && activeStaff
                ? `Personal shift schedule and assigned maintenance bookings`
                : `Scheduling dashboard for ${staffList.length} maintenance technicians`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Staff Filter Dropdown (Admin only) */}
            {!isTechnician && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-bold"
                >
                  <option value="ALL">All {staffList.length} Technicians</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role.split(' ')[0]})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Mode Switcher Buttons */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-extrabold">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-[#00204a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly View
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-[#00204a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly View
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'daily'
                    ? 'bg-[#00204a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily View
              </button>
            </div>
          </div>
        </div>

        {/* Date Controls & Technician Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#00204a] transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-black text-[#00204a] min-w-[150px] text-center tracking-tight">
              {viewMode === 'monthly'
                ? `${monthName} ${currentYear}`
                : viewMode === 'weekly'
                ? `${weekDays[0]?.fullDate} - ${weekDays[6]?.fullDate}, ${currentYear}`
                : currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#00204a] transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-bold transition-all cursor-pointer shadow-2xs"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold">Legend:</span>
            <div className="flex items-center gap-1 text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Available / Tasks</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Off / Empty</span>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN DUAL PANEL: LEFT CALENDAR (7 COLS) + RIGHT DETAILS PANEL (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE: COMPACT CALENDAR GRID (lg:col-span-7) */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        >
          {viewMode === 'monthly' ? (
            /* COMPACT 7-DAY MONTHLY CALENDAR MATRIX */
            <div className="overflow-x-auto scrollbar-thin">
              <div className="space-y-2 min-w-[500px]">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-[#00204a] uppercase tracking-wider pb-1.5 border-b border-slate-200">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="py-1 bg-slate-100/80 rounded-lg">{w}</div>
                  ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Lead Empty Cells */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px] bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />
                  ))}

                  {/* Month Day Cells */}
                  {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                    const formattedMonth = currentMonthIdx + 1 < 10 ? `0${currentMonthIdx + 1}` : `${currentMonthIdx + 1}`;
                    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

                    const dayBookings = getDayBookings(dateStr);
                    const isSelected = dateStr === selectedDateStr;
                    const isToday = dateStr === '2026-08-06' || dateStr === '2026-08-07';

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDateStr(dateStr)}
                        className={`min-h-[85px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'bg-sky-50/90 border-2 border-[#00204a] shadow-xs'
                            : isToday
                            ? 'bg-amber-50/60 border border-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Day Number */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
                              isSelected
                                ? 'bg-[#00204a] text-white shadow-xs'
                                : 'text-slate-800'
                            }`}
                          >
                            {dayNum}
                          </span>
                        </div>

                        {/* Minimal Dot Indicators (NO Multi-line text cards inside cell!) */}
                        <div className="my-1 flex flex-wrap items-center justify-center gap-1 min-h-[22px]">
                          {dayBookings.length > 0 ? (
                            dayBookings.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className="w-3 h-3 rounded-full inline-block bg-emerald-500 shadow-2xs ring-2 ring-emerald-200 animate-pulse"
                                title={`⏰ ${b.timeSlot}: ${b.title}`}
                              />
                            ))
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" title="Available" />
                          )}
                        </div>

                        <div className="text-[9px] font-bold text-slate-400 border-t border-slate-100 pt-0.5 flex items-center justify-between">
                          <span>{dayBookings.length > 0 ? `${dayBookings.length} Work Order${dayBookings.length > 1 ? 's' : ''}` : 'Free'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : viewMode === 'weekly' ? (
            /* COMPACT WEEKLY COLUMNS */
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[600px]">
                {weekDays.map((d) => {
                  const dayBookings = getDayBookings(d.dateStr);
                  const isSelected = d.dateStr === selectedDateStr;

                  return (
                    <div
                      key={d.dateStr}
                      onClick={() => setSelectedDateStr(d.dateStr)}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between min-h-[320px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50/90 border-2 border-[#00204a] shadow-xs'
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-center pb-2 border-b border-slate-200">
                        <p className="text-[10px] font-black uppercase text-[#00204a]">{d.dayCode}</p>
                        <p className="text-xs font-black text-slate-900 mt-0.5">{d.fullDate}</p>
                      </div>

                      <div className="my-auto flex flex-col items-center justify-center space-y-1 py-4">
                        {dayBookings.length > 0 ? (
                          dayBookings.map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs ring-2 ring-emerald-200 animate-pulse"
                              title={`⏰ ${b.timeSlot}: ${b.title}`}
                            />
                          ))
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" title="Available" />
                        )}
                        <span className="text-[10px] font-bold text-slate-600 mt-1">
                          {dayBookings.length} Tasks
                        </span>
                      </div>

                      <div className="text-[9px] text-center font-bold text-slate-400 border-t border-slate-100 pt-1">
                        Select
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* COMPACT DAILY VIEW */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 flex items-center justify-between text-xs">
                <span className="font-black">{currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="font-bold">{getDayBookings(selectedDateStr).length} Tasks</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {TIME_SLOTS.map((slot) => {
                  const matchingJobs = getDayBookings(selectedDateStr).filter((b) => b.timeSlot === slot);
                  return (
                    <div key={slot} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <span className="font-mono font-bold text-slate-900">{slot}</span>
                      {matchingJobs.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                          {matchingJobs[0].title}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT SIDE: SELECTED DATE TASK DETAILS PANEL (lg:col-span-5) */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#00204a] flex items-center gap-2">
                  <CalendarIcon size={18} className="text-sky-600" /> Work Order Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{formatSelectedDateTitle(selectedDateStr)}</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full shadow-2xs">
                {selectedDateBookings.length} Work Order{selectedDateBookings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Task Details List */}
            <div className="space-y-3 mt-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {selectedDateBookings.length > 0 ? (
                selectedDateBookings.map((job, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-[#00204a] transition-all space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> BOOKED
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        ⏰ {job.timeSlot} ({job.duration}h)
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{job.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">🏠 Resident: {job.tenantName} — {job.address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: job.staffColor }} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{job.staffName}</p>
                          <p className="text-[10px] text-slate-500">{job.staffRole || 'Technician'}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#00204a] text-slate-700 hover:text-white transition-all cursor-pointer shadow-2xs border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
                        title="Inspect Work Order"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 space-y-2 my-4">
                  <CheckCircle2 size={26} className="mx-auto text-emerald-500" />
                  <p className="text-xs font-bold text-slate-700">Technician Available</p>
                  <p className="text-[11px] text-slate-400">No scheduled work orders on this selected date.</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
            Click any date on the left calendar to inspect work order details
          </div>
        </motion.div>
      </div>

      {/* COMPREHENSIVE TASKS & WORK ORDERS DIRECTORY TABLE BELOW */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-[#00204a] flex items-center gap-2">
              <CalendarIcon size={18} className="text-sky-600" /> Maintenance Tasks & Work Orders Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Complete breakdown of all active scheduled work orders and technician assignments</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Table Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search tasks, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#00204a] font-medium"
              />
            </div>

            <span className="text-xs font-bold text-[#00204a] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
              {searchedBookings.length} Work Orders Total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00204a] text-white font-extrabold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Work Order / Description</th>
                <th className="px-4 py-3.5">Assigned Technician</th>
                <th className="px-4 py-3.5">Resident & Address</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {searchedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-semibold">
                    No active maintenance work orders match your query.
                  </td>
                </tr>
              ) : (
                searchedBookings.map((job, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Booked Job
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <p>{job.date}</p>
                      <p className="text-[11px] text-amber-700 font-mono font-semibold">⏰ {job.timeSlot} ({job.duration}h)</p>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs">
                      <p className="leading-snug">{job.title}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: job.staffColor || '#10b981' }} />
                        <div>
                          <p className="font-bold text-slate-900">{job.staffName || 'Technician'}</p>
                          <p className="text-[10px] text-slate-500">{job.staffRole || 'Staff'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="font-bold text-slate-900">{job.tenantName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{job.address}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#00204a] text-slate-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* JOB INSPECTION MODAL */}
      <FormModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={`Work Order Details — ${selectedJob?.title || ''}`}
      >
        {selectedJob && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedJob.title}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🟢 {selectedJob.status}
                </span>
              </div>
              <p className="text-slate-600 font-medium">Resident: {selectedJob.tenantName} — {selectedJob.address}</p>
              <div className="flex items-center gap-4 text-slate-700 font-mono font-bold pt-2 border-t border-slate-200">
                <span>📅 Date: {selectedJob.date}</span>
                <span>⏰ Slot: {selectedJob.timeSlot} ({selectedJob.duration}h)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 font-bold flex items-center justify-between">
              <span>👤 Assigned Staff: {selectedJob.staffName}</span>
              <span className="text-xs text-sky-700">({selectedJob.staffRole || 'Technician'})</span>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
