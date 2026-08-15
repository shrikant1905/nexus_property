import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Calendar as CalendarIcon, User, MapPin, Search, Clock, Wrench } from 'lucide-react';
import { jobService } from '../../services/jobService';
import FormModal from '../../components/modals/FormModal';
import Toast from '../../components/common/Toast';

export default function OfficeBookingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const res = await jobService.getJobs();
      const allJobs = Array.isArray(res) ? res : res?.data || [];
      // Only show jobs relevant to scheduling (exclude Quotes, Completed Quotes, Completed Jobs)
      const bookingJobs = allJobs.filter(j => 
        j.section === 'Jobs Waiting Booking' || j.section === 'Jobs'
      );
      setJobs(bookingJobs);
    } catch (err) {
      showToast('⚠ Could not load bookings.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadBookings();
      setLoading(false);
    };
    init();
  }, [loadBookings]);

  const filteredJobs = jobs.filter(j =>
    (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.jobNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00204a] tracking-tight flex items-center gap-2.5">
            <CalendarIcon size={24} className="text-blue-500 flex-shrink-0" />
            <span>Operational Bookings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            View active bookings and jobs awaiting schedule
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, tenant, title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">Loading bookings...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CalendarIcon size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-semibold">No active bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Job ID & Title</th>
                  <th className="p-4">Resident / Property</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredJobs.map(job => (
                  <tr 
                    key={job.id} 
                    onClick={() => setSelectedJob(job)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#00204a]">{job.jobNumber}</div>
                      <div className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{job.title}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <User size={12} className="text-slate-400" /> {job.tenantName || '—'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} className="text-slate-400" /> <span className="truncate max-w-[200px]">{job.address || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        job.section === 'Jobs' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {job.section === 'Jobs' ? <Wrench size={12}/> : <Clock size={12}/>}
                        {job.section === 'Jobs' ? 'Booked' : 'Waiting Booking'}
                      </span>
                    </td>
                    <td className="p-4">
                      {job.scheduledDate ? (
                        <div className="text-xs font-bold text-slate-700">
                          {job.scheduledDate} <br/>
                          <span className="text-slate-500 font-medium">{job.scheduledTimeSlot || 'Time TBD'} ({job.durationHours}h)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700">
                      {job.assignedStaffName || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.jobNumber || 'Booking Details'}
      >
        {selectedJob && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-black text-sm text-slate-800">{selectedJob.title}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 font-semibold mb-1">Resident</p>
                  <p className="font-bold text-slate-700">{selectedJob.tenantName || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold mb-1">Contact</p>
                  <p className="font-bold text-slate-700">{selectedJob.contactPhone || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 font-semibold mb-1">Property Address</p>
                  <p className="font-bold text-slate-700">{selectedJob.address || '—'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
              <h3 className="font-black text-sm text-blue-900 flex items-center gap-1.5">
                <CalendarIcon size={16} /> Schedule Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-700/70 font-semibold mb-1">Status</p>
                  <p className="font-bold text-blue-900">{selectedJob.section}</p>
                </div>
                <div>
                  <p className="text-blue-700/70 font-semibold mb-1">Duration</p>
                  <p className="font-bold text-blue-900">{selectedJob.durationHours} hours</p>
                </div>
                <div>
                  <p className="text-blue-700/70 font-semibold mb-1">Assigned Technician</p>
                  <p className="font-bold text-blue-900">{selectedJob.assignedStaffName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-blue-700/70 font-semibold mb-1">Scheduled Date & Time</p>
                  <p className="font-bold text-blue-900">
                    {selectedJob.scheduledDate ? `${selectedJob.scheduledDate} at ${selectedJob.scheduledTimeSlot || 'TBD'}` : 'Unscheduled'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-slate-500 font-medium">To reschedule or dispatch this job, please use the <strong className="text-[#00204a]">Dispatch Calendar</strong>.</p>
            </div>
          </div>
        )}
      </FormModal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
