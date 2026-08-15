import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, X, Image as ImageIcon, Video as VideoIcon, CheckCircle2, AlertCircle,
  ShieldCheck, User, MapPin, FileText, Send, Sparkles, Loader2
} from 'lucide-react';
import { publicPortalService } from '../../services/publicPortalService';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export default function ResidentQuoteUploadPage() {
  const { secureToken } = useParams();

  const [validation, setValidation] = useState(null);
  const [request, setRequest] = useState(null);

  // Selected Files & Previews State
  const [selectedFiles, setSelectedFiles] = useState([]); // [{ file, previewUrl, name, sizeMB, type, isVideo, id }]
  const [residentComments, setResidentComments] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const loadRequestData = useCallback(async () => {
    try {
      const res = await publicPortalService.getPublicRequestInfo(secureToken);
      if (res.data) {
        setValidation({ valid: true });
        setRequest(res.data);
      } else {
        setValidation({ valid: false, message: 'Invalid or expired photo request link.' });
      }
    } catch (err) {
      setValidation({ valid: false, message: err.message || 'Invalid or expired secure token link.' });
    }
  }, [secureToken]);

  // Load and Validate Token
  useEffect(() => {
    loadRequestData();
  }, [loadRequestData]);

  // Clean up Object URLs on component unmount to prevent memory leaks!
  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [selectedFiles]);

  // Handle File Input Selection with Strict Validation
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const errors = [];
    const maxAllowed = request?.maxPhotos || 10;
    const currentCount = selectedFiles.length;

    if (currentCount + files.length > maxAllowed) {
      errors.push(`Maximum ${maxAllowed} files allowed. You selected ${currentCount + files.length} total.`);
    }

    const validNewItems = [];

    files.forEach((file) => {
      const mimeType = file.type.toLowerCase();
      const isVideo = mimeType.startsWith('video/');

      // 1. Format Validation
      if (!ALLOWED_TYPES.includes(mimeType)) {
        errors.push(`'${file.name}' rejected. Allowed formats: JPG, PNG, WEBP, MP4, MOV, WEBM.`);
        return;
      }

      // 2. Size Validation (Max 10MB for images, 50MB for videos)
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const limitMB = isVideo ? 50 : 10;
        errors.push(`'${file.name}' (${sizeMB}MB) exceeds the ${limitMB}MB size limit.`);
        return;
      }

      // Check max limit
      if (selectedFiles.length + validNewItems.length >= maxAllowed) {
        return;
      }

      // Generate object URL preview
      const previewUrl = URL.createObjectURL(file);
      validNewItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        previewUrl,
        name: file.name,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        type: mimeType.replace('image/', '').replace('video/', '').toUpperCase(),
        isVideo,
      });
    });

    setValidationErrors(errors);
    if (validNewItems.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validNewItems]);
    }

    // Reset input value
    e.target.value = '';
  };

  // Remove File Thumbnail & Revoke Object URL
  const handleRemoveFile = (id) => {
    setSelectedFiles((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove && itemToRemove.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  // Submit Photos Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setValidationErrors(['Please select at least 1 photo to upload.']);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach((item) => {
        if (item.file) {
          formData.append('mediaFiles', item.file);
        }
      });
      formData.append('residentComments', residentComments);

      await publicPortalService.uploadPublicQuotePhotos(secureToken, formData);

      setSubmittedSuccess(true);
      setIsSubmitting(false);
      await loadRequestData();
    } catch (err) {
      setValidationErrors([err.message || 'Failed to upload photos.']);
      setIsSubmitting(false);
    }
  };


  if (!validation) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <p className="text-sm text-slate-400 font-medium">Validating photo upload link...</p>
      </div>
    );
  }

  // Handle Token States: Invalid, Expired, Revoked, Cancelled
  if (!validation.valid && validation.state === 'INVALID_TOKEN') {
    return <PublicErrorCard title="Invalid Upload Link" message="This photo upload link does not exist or is invalid. Please contact your property manager for a new link." />;
  }

  if (!validation.valid && validation.state === 'EXPIRED_TOKEN') {
    return <PublicErrorCard title="Upload Link Expired" message="This photo request link has expired. Please contact your property manager to receive a new upload link." />;
  }

  if (!validation.valid && validation.state === 'CANCELLED_REQUEST') {
    return <PublicErrorCard title="Quote Request Cancelled" message="This quote request has been cancelled by property management." />;
  }

  const req = request || validation.request;
  const isAlreadySubmitted = submittedSuccess || req.status === 'PHOTOS_RECEIVED' || req.status === 'QUOTE_PENDING' || req.status === 'QUOTE_COMPLETED';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 select-none flex flex-col justify-between">
      {/* Mobile-First Public Header */}
      <header className="bg-[#00204a] border-b border-[#001738] sticky top-0 z-30 px-4 py-3.5 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#00204a] font-black text-xs shadow-xs">
              NEX
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight">Nexus FMS</p>
              <p className="text-sky-200/70 text-[10px] font-medium">Photos & Video Upload Portal</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-sky-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            <ShieldCheck size={12} /> Secure Upload
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto p-4 flex-1 my-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-5">
          {/* Job Overview */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quote Inspection Request</span>
              <span className="text-xs font-black text-[#00204a] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Max {req.maxPhotos || 5} Files
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

          {/* Photo & Video Instructions Box */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-1">
            <p className="font-bold text-[#00204a] flex items-center gap-1.5">
              <Sparkles size={14} className="text-sky-600" /> Upload Instructions:
            </p>
            <p className="text-slate-700 leading-relaxed font-medium">
              {req.photoInstructions || 'Please upload photos or short video clips showing the maintenance issue clearly.'}
            </p>
          </div>

          {/* STATE A: SUBMITTED CONFIRMATION */}
          {isAlreadySubmitted ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                <h2 className="text-base font-black text-emerald-900">Files & Report Submitted Successfully!</h2>
                <p className="text-xs text-slate-600 font-medium">
                  Thank you! Our Nexus FMS maintenance team is reviewing your uploaded media and preparing the work estimate.
                </p>
              </div>

              {/* Submitted Media Preview */}
              {req.photos && req.photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-700">Submitted Files ({req.photos.length}):</p>
                  <div className="grid grid-cols-3 gap-2">
                    {req.photos.map((img, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 h-20 shadow-xs">
                        {img.isVideo ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50 text-sky-800 text-center p-1">
                            <VideoIcon size={20} />
                            <span className="text-[9px] font-bold mt-1">VIDEO</span>
                          </div>
                        ) : img.previewUrl ? (
                          <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {req.residentComments && (
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-700">Your Submitted Issue Report:</p>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                    {req.residentComments}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* STATE B: UPLOAD FORM */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Validation Alerts */}
              {validationErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1 font-medium">
                  {validationErrors.map((err, i) => (
                    <p key={i} className="flex items-center gap-1.5">
                      <AlertCircle size={13} className="flex-shrink-0 text-red-600" /> {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Upload Drop Zone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Upload Photos & Video (Max {req.maxPhotos || 5} files, Images & Videos supported)
                </label>

                <label className="flex flex-col items-center justify-center p-6 rounded-2xl bg-sky-50/60 border-2 border-dashed border-sky-300 hover:border-[#00204a] hover:bg-sky-100/50 transition-all cursor-pointer text-center group">
                  <div className="flex items-center gap-2 mb-2 text-[#00204a] group-hover:scale-110 transition-transform">
                    <UploadCloud size={28} />
                    <VideoIcon size={24} />
                  </div>
                  <span className="text-xs font-extrabold text-[#00204a]">Tap to select Photos or Videos</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-medium">JPG, PNG, WEBP, MP4, MOV up to 50MB</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/webm,video/ogg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Thumbnail Previews Grid */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-800">Selected Media ({selectedFiles.length}/{req.maxPhotos || 5})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-red-600 hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {selectedFiles.map((item) => (
                      <div key={item.id} className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group h-24 shadow-xs">
                        {item.isVideo ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50 text-sky-800 p-1">
                            <VideoIcon size={24} />
                            <span className="text-[9px] font-bold mt-1 text-slate-700 truncate w-full text-center">{item.name}</span>
                            <span className="text-[8px] text-slate-500">{item.sizeMB} MB</span>
                          </div>
                        ) : (
                          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        )}
                        
                        {/* Remove Button Overlay */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors cursor-pointer z-10"
                          title="Remove media"
                        >
                          <X size={13} />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-slate-900/80 text-[9px] text-white truncate font-mono">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resident Issue Report Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Issue Description & Report *</label>
                <textarea
                  rows={3}
                  value={residentComments}
                  onChange={(e) => setResidentComments(e.target.value)}
                  placeholder="Provide detailed description or report of what issue is happening..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                disabled={isSubmitting || selectedFiles.length === 0}
                type="submit"
                className={`w-full py-3.5 rounded-xl font-extrabold text-white text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedFiles.length > 0
                    ? 'bg-[#00204a] hover:bg-[#001738] shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span>Submitting Media & Report...</span>
                ) : (
                  <>
                    <Send size={15} /> Submit {selectedFiles.length} Media File(s) & Report
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-600 py-4 px-4 border-t border-white/5">
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
          <span className="text-[11px] text-slate-500 font-mono">AP Maintenance Security System</span>
        </div>
      </div>
    </div>
  );
}
