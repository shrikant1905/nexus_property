import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Copy, ExternalLink, Check, MessageSquare, Mail,
  Clock, Shield, User, MapPin, Sparkles, Image as ImageIcon,
  CheckCircle2, AlertCircle, Eye, Trash2, Calendar
} from 'lucide-react';
import { quoteService } from '../../services/quoteService';
import { tenantService } from '../../services/tenantService';
import FormModal from '../../components/modals/FormModal';
import { FormField, SelectField } from '../../components/forms/FormFields';
import { slideInBottom } from '../../utils/motionVariants';

const EXPIRY_OPTIONS = [
  { value: '1', label: '1 Day' },
  { value: '3', label: '3 Days' },
  { value: '7', label: '7 Days (Recommended)' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
];

const MAX_PHOTOS_OPTIONS = [
  { value: '3', label: '3 Photos' },
  { value: '5', label: '5 Photos (Default)' },
  { value: '8', label: '8 Photos' },
  { value: '10', label: '10 Photos (Max)' },
];

export default function MaintenanceQuoteRequestPage() {
  const [tenants, setTenants] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadQuoteData = async () => {
      try {
        const [requestsRes, tenantsRes] = await Promise.all([
          quoteService.getQuoteRequests().catch(() => []),
          tenantService.getTenants().catch(() => []),
        ]);
        setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || []);
        setTenants(Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.data || []);
      } catch (err) {
        setRequests([]);
        setTenants([]);
      }
    };
    loadQuoteData();
  }, []);

  const [form, setForm] = useState({
    tenantId: tenants[0]?.id || '',
    description: '',
    photoInstructions: 'Please upload clear photos showing the issue, damage area, and serial plate if relevant.',
    maxPhotos: '5',
    linkExpiryDays: '7',
    internalNotes: '',
  });

  const [generatedResult, setGeneratedResult] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [inspectRequest, setInspectRequest] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      alert('Please enter a work or inspection description.');
      return;
    }

    try {
      const result = await quoteService.generateQuoteRequestLink(form);
      setGeneratedResult(result);
      const requestsRes = await quoteService.getQuoteRequests().catch(() => []);
      setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || []);
    } catch (err) {
      alert(err.message || 'Failed to generate quote request link');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleStatusChange = async (token, newStatus) => {
    try {
      await quoteService.updateQuoteStatus(token, newStatus);
      const requestsRes = await quoteService.getQuoteRequests().catch(() => []);
      setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || []);
      if (inspectRequest && inspectRequest.secureToken === token) {
        const updatedReq = await quoteService.getQuoteRequestByToken(token).catch(() => null);
        if (updatedReq) {
          // Normalize matching structure for backend response
          const requestInfo = updatedReq.data || updatedReq;
          // Merge details from current inspectRequest if needed, or query direct details
          const matchingReq = (requestsRes.data || requestsRes).find(r => r.secureToken === token);
          setInspectRequest(matchingReq || requestInfo);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update quote status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PHOTOS_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> COMPLETE
          </span>
        );
      case 'QUOTE_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> QUOTE PENDING
          </span>
        );
      case 'QUOTE_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> QUOTE COMPLETED
          </span>
        );
      case 'QUOTE_CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-red-500" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> PENDING UPLOAD
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#00204a] tracking-tight">Quote Photo Request Link Generator</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Send tenants a link to upload photos and comments for maintenance quotes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-base font-black text-[#00204a] mb-4 flex items-center gap-2">
            <Camera className="text-purple-600" size={18} /> New Photo Request Link
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4 text-sm">
            <SelectField
              label="Select Resident / Property *"
              name="tenantId"
              value={form.tenantId}
              onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
              options={tenants.map((t) => ({ value: t.id, label: `${t.name} — ${t.address}` }))}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work / Inspection Description *</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Kitchen Cabinet Water Damage & Mold Inspection"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Instructions for Resident</label>
              <textarea
                rows={2}
                value={form.photoInstructions}
                onChange={(e) => setForm({ ...form, photoInstructions: e.target.value })}
                placeholder="Instructions telling tenant what angles or items to photograph..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Maximum Photos Allowed"
                name="maxPhotos"
                value={form.maxPhotos}
                onChange={(e) => setForm({ ...form, maxPhotos: e.target.value })}
                options={MAX_PHOTOS_OPTIONS}
              />

              <SelectField
                label="Link Expiry Period"
                name="linkExpiryDays"
                value={form.linkExpiryDays}
                onChange={(e) => setForm({ ...form, linkExpiryDays: e.target.value })}
                options={EXPIRY_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes (Optional)</label>
              <input
                type="text"
                value={form.internalNotes}
                onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                placeholder="e.g. Check for cabinet base swelling"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Camera size={16} /> Generate Quote Upload Link & Messages
            </motion.button>
          </form>
        </motion.div>

        {/* Output Action Panel */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h2 className="text-base font-black text-[#00204a] mb-4 flex items-center gap-2">
              <Camera className="text-purple-600" size={18} /> Upload Link Output
            </h2>

            {!generatedResult ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Clock size={32} className="mx-auto text-slate-400" />
                <p className="text-xs text-slate-500 font-medium">Fill out the form on the left to generate photo upload SMS & Email links.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-purple-200 space-y-2">
                  <span className="text-[11px] text-purple-800 font-bold uppercase tracking-wider block">
                    Public Upload URL (UUID Secure Token):
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-900 shadow-2xs">
                    <span className="truncate">{generatedResult.publicUrl}</span>
                    <button
                      onClick={() => copyToClipboard(generatedResult.publicUrl, 'URL')}
                      className="p-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer flex-shrink-0"
                    >
                      {copiedType === 'URL' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => copyToClipboard(generatedResult.smsMessage, 'SMS')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare size={15} className="text-sky-600" /> Copy SMS Message
                    </span>
                    {copiedType === 'SMS' ? <span className="text-emerald-700 text-[11px] font-bold">Copied!</span> : <Copy size={14} className="text-slate-400" />}
                  </button>

                  <button
                    onClick={() => copyToClipboard(generatedResult.emailMessage, 'EMAIL')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Mail size={15} className="text-purple-600" /> Copy Email Message
                    </span>
                    {copiedType === 'EMAIL' ? <span className="text-emerald-700 text-[11px] font-bold">Copied!</span> : <Copy size={14} className="text-slate-400" />}
                  </button>
                </div>

                <a
                  href={generatedResult.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-[#00204a] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#001738] shadow-md transition-colors cursor-pointer"
                >
                  Open Resident Upload Portal <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Secure Token Architecture</span>
            <span>Max Photos: {form.maxPhotos}</span>
          </div>
        </motion.div>
      </div>

      {/* Generated Requests Table */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#00204a]">Quote Request Links & Received Submissions</h3>
          <span className="text-xs text-slate-500 font-medium">{requests.length} Requests Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00204a] text-white font-extrabold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Resident & Address</th>
                <th className="px-6 py-3.5">Work Description</th>
                <th className="px-6 py-3.5">Received Photos</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right min-w-[220px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {requests.map((req) => {
                const hasPhotos = req.photos && req.photos.length > 0;
                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{req.tenantName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.address}</p>
                    </td>

                    <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-800">
                      {req.description}
                    </td>

                    {/* Received Photos Column with Image Thumbnails */}
                    <td className="px-6 py-4">
                      {hasPhotos ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden py-0.5">
                            {req.photos.map((img, i) => (
                              <img
                                key={i}
                                src={img.previewUrl}
                                alt={img.name}
                                className="inline-block h-8 w-8 rounded-lg object-cover ring-2 ring-white border border-emerald-300 shadow-2xs"
                              />
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-2xs">
                            <Camera size={13} className="text-emerald-600" /> {req.photos.length} Photo{req.photos.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200">
                          <Camera size={13} className="text-slate-400" /> 0 Uploaded
                        </span>
                      )}
                    </td>

                    {/* Status Badge Column */}
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>

                    {/* Action Buttons Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectRequest(req)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-[#00204a] text-slate-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                          title={hasPhotos ? 'View Resident & Photo Details' : 'View Details'}
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={`/quote-upload/${req.secureToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer shadow-2xs"
                          title="Open Resident Upload Portal"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Inspect Received Photos & Resident Details Modal */}
      <FormModal
        isOpen={!!inspectRequest}
        onClose={() => setInspectRequest(null)}
        title={`Resident Submission Details — ${inspectRequest?.tenantName}`}
      >
        {inspectRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Work / Inspection Description:</span>
                <span className="text-white font-bold">{inspectRequest.description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Address:</span>
                <span className="text-slate-200">{inspectRequest.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Current Status:</span>
                <div>{getStatusBadge(inspectRequest.status)}</div>
              </div>
              {inspectRequest.submittedAt && (
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-medium">Submitted At:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {new Date(inspectRequest.submittedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Resident Comments Provided by Resident */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
              <p className="text-purple-300 font-bold flex items-center gap-1.5 text-xs">
                <Sparkles size={14} /> Comments / Details Provided by Resident:
              </p>
              <p className="text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                {inspectRequest.residentComments || <span className="text-slate-500 italic">No additional comments provided by resident.</span>}
              </p>
            </div>

            {/* Uploaded Photos Display & Gallery */}
            <div>
              <p className="text-slate-300 font-bold mb-2 flex items-center justify-between">
                <span>Uploaded Photos ({inspectRequest.photos?.length || 0}):</span>
                {inspectRequest.photos?.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-normal">Click any photo to view full size</span>
                )}
              </p>

              {!inspectRequest.photos || inspectRequest.photos.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-white/10 text-center space-y-1 text-slate-500">
                  <ImageIcon size={28} className="mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">No photos uploaded yet by resident.</p>
                  <p className="text-[11px]">Resident photo upload link is pending.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {inspectRequest.photos.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setZoomedImage(img)}
                      className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer shadow-md"
                    >
                      {img.previewUrl ? (
                        <img src={img.previewUrl} alt={img.name} className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-28 bg-slate-800 flex items-center justify-center text-slate-500">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                        <Eye size={14} /> Zoom Photo
                      </div>
                      <div className="p-1.5 bg-slate-900/90 backdrop-blur-xs text-[10px] text-slate-300 truncate font-mono">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Workflow Status Actions */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-slate-400 font-semibold">Update Quote Status:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(inspectRequest.secureToken, 'QUOTE_PENDING')}
                  className="px-3 py-2 rounded-xl bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-pointer"
                >
                  Mark Quote Pending
                </button>
                <button
                  onClick={() => handleStatusChange(inspectRequest.secureToken, 'QUOTE_COMPLETED')}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                >
                  Mark Quote Completed
                </button>
                <button
                  onClick={() => handleStatusChange(inspectRequest.secureToken, 'QUOTE_CANCELLED')}
                  className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
                >
                  Cancel Quote Request
                </button>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Full Size Zoomed Image Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-[#0e1526] border border-white/20 rounded-3xl overflow-hidden p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white truncate">{zoomedImage.name}</span>
              <span className="text-[10px] text-slate-400">{zoomedImage.sizeMB} MB</span>
            </div>
            <img src={zoomedImage.previewUrl} alt={zoomedImage.name} className="w-full max-h-[70vh] object-contain rounded-2xl bg-black/50" />
            <p className="text-center text-xs text-slate-400">Click anywhere to close full preview</p>
          </div>
        </div>
      )}
    </div>
  );
}
