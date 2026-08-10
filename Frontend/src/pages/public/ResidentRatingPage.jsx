import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, ThumbsUp, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { quoteService } from '../../services/quoteService';

export default function ResidentRatingPage() {
  const { secureToken } = useParams();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPills, setSelectedPills] = useState(['Punctual', 'Clean Work', 'Professional']);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const allJobs = maintenanceService.getJobs();
  const matchedJob = allJobs.find(
    (j) =>
      j.id === secureToken ||
      (secureToken && j.id && (secureToken.includes(j.id) || j.id.includes(secureToken)))
  );
  const cleanJobId = matchedJob ? matchedJob.id : secureToken;

  const availablePills = [
    'Punctual', 'Clean Work', 'Professional', 'Fast Repair',
    'Friendly', 'Great Communication', 'Solves Problem First Time'
  ];

  const togglePill = (pill) => {
    if (selectedPills.includes(pill)) {
      setSelectedPills(selectedPills.filter((p) => p !== pill));
    } else {
      setSelectedPills([...selectedPills, pill]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    maintenanceService.submitResidentRating({
      token: secureToken,
      jobId: cleanJobId,
      residentName: matchedJob?.tenantName || 'Resident',
      staffName: matchedJob?.assignedStaffName || 'Dave Miller',
      rating,
      pills: selectedPills,
      comments,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center shadow-[0_4px_20px_rgba(2,132,199,0.4)]">
            <span className="text-white font-black text-xs">NEXUS</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Nexus FMS</h1>
            <p className="text-xs text-slate-400 font-semibold">Facility Management System • nexusfms.com</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSubmit}
              className="bg-[#0e1526] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Job Info Header */}
              <div className="text-center space-y-2 border-b border-white/10 pb-5">
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  REPAIR COMPLETED
                </span>
                <h2 className="text-xl font-extrabold text-white">How was your service?</h2>
                <p className="text-xs text-slate-400">
                  Repair: <strong>{matchedJob?.title || 'Maintenance Repair Service'}</strong> • Tech: <strong>{matchedJob?.assignedStaffName || 'Dave Miller'}</strong>
                </p>
              </div>

              {/* Star Rating Control */}
              <div className="space-y-3 text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tap Stars to Rate</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none cursor-pointer"
                      >
                        <Star
                          size={36}
                          className={`transition-colors ${
                            active ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-xs font-extrabold text-amber-400">
                  {rating === 5 && '⭐⭐⭐⭐⭐ 5.0 — Exceptional Service!'}
                  {rating === 4 && '⭐⭐⭐⭐ 4.0 — Very Good!'}
                  {rating === 3 && '⭐⭐⭐ 3.0 — Average'}
                  {rating <= 2 && 'Need Improvement'}
                </p>
              </div>

              {/* What went well pills */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-300">What did you appreciate most?</p>
                <div className="flex flex-wrap gap-2">
                  {availablePills.map((pill) => {
                    const isSelected = selectedPills.includes(pill);
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => togglePill(pill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-white/15'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {pill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Additional Resident Comments (Optional):</label>
                <textarea
                  rows={3}
                  placeholder="Share details about your repair experience..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-[#009bf2] to-indigo-600 hover:brightness-110 shadow-[0_4px_20px_rgba(0,155,242,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={16} /> Submit Feedback Rating
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0e1526] border border-emerald-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-black text-white">Thank You for Your Review!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your feedback has been sent to our Property Management team and technician. We appreciate your tenancy!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
