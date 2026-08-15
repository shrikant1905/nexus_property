// Centralized Service for AP Maintenance System
// Removed fake mock records (Robert Fox, Jenny Wilson, Dave Miller, job-101, etc.)
// Data starts completely clean and ready to consume real MySQL API backend responses

const defaultTenants = [];
const defaultStaff = [];
const defaultJobs = [];
const defaultBookingRequests = [];
const defaultQuoteRequests = [];

// LocalStorage persistence helpers for cross-tab and refresh state sync
const loadStore = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultData;
  } catch (err) {
    return defaultData;
  }
};

const saveStore = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};

let tenantsStore = loadStore('ap_tenants_store', defaultTenants);
let staffStore = loadStore('ap_staff_store', defaultStaff);
let jobsStore = loadStore('ap_jobs_store', defaultJobs);
let bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
let quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);

function persistStores() {
  saveStore('ap_tenants_store', tenantsStore);
  saveStore('ap_staff_store', staffStore);
  saveStore('ap_jobs_store', jobsStore);
  saveStore('ap_booking_requests_store', bookingRequestsStore);
  saveStore('ap_quote_requests_store', quoteRequestsStore);
}

// Helper: Convert 'HH:MM' string to total minutes from 00:00
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert total minutes to 'HH:MM'
function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export const maintenanceService = {
  // TENANTS API
  getTenants: () => {
    tenantsStore = loadStore('ap_tenants_store', defaultTenants);
    return [...tenantsStore];
  },

  addTenant: (tenantData) => {
    const newTenant = {
      id: `ten-${Date.now()}`,
      ...tenantData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    tenantsStore = [newTenant, ...tenantsStore];
    persistStores();
    return newTenant;
  },

  updateTenant: (id, updatedData) => {
    tenantsStore = tenantsStore.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    persistStores();
    return tenantsStore.find((t) => t.id === id);
  },

  deleteTenant: (id) => {
    tenantsStore = tenantsStore.filter((t) => t.id !== id);
    persistStores();
  },

  // STAFF API
  getStaff: () => {
    staffStore = loadStore('ap_staff_store', defaultStaff);
    return [...staffStore];
  },

  addStaff: (staffData) => {
    const colors = ['#009bf2', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];
    const formattedName = staffData.name
      ? staffData.name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : 'Staff Member';
    const newStaff = {
      id: `stf-${Date.now()}`,
      color: colors[staffStore.length % colors.length],
      unavailable: [],
      ...staffData,
      name: formattedName,
    };
    staffStore = [...staffStore, newStaff];
    persistStores();
    return newStaff;
  },

  updateStaff: (id, updatedData) => {
    const formattedData = { ...updatedData };
    if (formattedData.name) {
      formattedData.name = formattedData.name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    staffStore = staffStore.map((s) => (s.id === id ? { ...s, ...formattedData } : s));
    persistStores();
    return staffStore.find((s) => s.id === id);
  },

  // JOBS / DASHBOARD API
  getJobs: () => {
    jobsStore = loadStore('ap_jobs_store', defaultJobs);
    // Deduplicate any accidental duplicate jobs with the exact same ID or secureToken
    const seen = new Map();
    jobsStore.forEach((j) => {
      const key = j.id || j.secureToken;
      if (key && !seen.has(key)) {
        seen.set(key, j);
      }
    });
    jobsStore = Array.from(seen.values());
    persistStores();
    return [...jobsStore];
  },

  updateJobSection: (jobId, newSection) => {
    jobsStore = jobsStore.map((j) => (j.id === jobId ? { ...j, section: newSection } : j));
    persistStores();
    return jobsStore.find((j) => j.id === jobId);
  },

  updateJobStaff: (jobId, staffId, staffName) => {
    jobsStore = jobsStore.map((j) => {
      if (j.id === jobId) {
        // Automatically progress job to 'Jobs' section when staff is assigned from Quotes or Waiting Booking!
        const autoSection = (j.section === 'Quotes' || j.section === 'Jobs Waiting Booking') ? 'Jobs' : j.section;
        return {
          ...j,
          assignedStaffId: staffId,
          assignedStaffName: staffName || 'Unassigned',
          section: autoSection,
        };
      }
      return j;
    });
    persistStores();
    return jobsStore.find((j) => j.id === jobId);
  },

  addJob: (jobData) => {
    jobsStore = loadStore('ap_jobs_store', defaultJobs);
    
    // Check if job already exists by ID or secureToken
    const existingIndex = jobsStore.findIndex(
      (j) => (jobData.id && j.id === jobData.id) || (jobData.secureToken && j.secureToken === jobData.secureToken)
    );

    if (existingIndex !== -1) {
      // Update existing job card instead of creating duplicate!
      jobsStore[existingIndex] = {
        ...jobsStore[existingIndex],
        ...jobData,
      };
      persistStores();
      return jobsStore[existingIndex];
    }

    const newJob = {
      id: `job-${Date.now()}`,
      section: jobData.section || 'Quotes',
      secureToken: `tok_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...jobData,
    };
    jobsStore = [newJob, ...jobsStore];
    persistStores();
    return newJob;
  },

  getJobByToken: (token) => {
    jobsStore = loadStore('ap_jobs_store', defaultJobs);
    return jobsStore.find((j) => j.secureToken === token);
  },

  getCalendarBookings: () => {
    jobsStore = loadStore('ap_jobs_store', defaultJobs);
    return jobsStore.filter((j) => j.scheduledDate);
  },

  // PHASE 2: BOOKING SYSTEM METHODS
  getBookingRequests: () => {
    bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
    return [...bookingRequestsStore];
  },

  generateBookingLink: (formData) => {
    tenantsStore = loadStore('ap_tenants_store', defaultTenants);
    staffStore = loadStore('ap_staff_store', defaultStaff);
    bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);

    const tenant = tenantsStore.find((t) => t.id === formData.tenantId);
    const assignedStaff = staffStore.find((s) => s.id === formData.assignmentPreference);
    
    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    const secureToken = `tok_${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}`;

    const expiryDays = parseInt(formData.linkExpiryDays || '7', 10);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expiryDays);

    const bookingReq = {
      id: `req-${Date.now()}`,
      secureToken,
      tenantId: formData.tenantId,
      tenantName: tenant ? tenant.name : 'Valued Resident',
      address: tenant ? tenant.address : 'Property Address',
      description: formData.description,
      durationHours: parseFloat(formData.durationHours) || 1.5,
      assignmentPreference: formData.assignmentPreference || 'ANY',
      assignedStaffId: assignedStaff ? assignedStaff.id : null,
      assignedStaffName: assignedStaff ? assignedStaff.name : 'Any Available Staff',
      earliestDate: formData.earliestDate || new Date().toISOString().split('T')[0],
      internalNotes: formData.internalNotes || '',
      expiryDays,
      expiresAt: expDate.toISOString().split('T')[0],
      status: 'WAITING_FOR_BOOKING',
      bookingDetails: null,
      createdAt: new Date().toISOString().split('T')[0],
    };

    bookingRequestsStore = [bookingReq, ...bookingRequestsStore];

    // Prevent duplicate job card: Update existing job if found by token or title match for this tenant
    const existingJob = jobsStore.find(
      (j) => (j.secureToken && j.secureToken === secureToken) || (j.tenantId === formData.tenantId && j.title === formData.description)
    );

    if (existingJob) {
      existingJob.section = 'Jobs Waiting Booking';
      existingJob.title = formData.description;
      existingJob.description = formData.description;
      existingJob.durationHours = parseFloat(formData.durationHours) || 1.5;
      if (assignedStaff) {
        existingJob.assignedStaffId = assignedStaff.id;
        existingJob.assignedStaffName = assignedStaff.name;
      }
      existingJob.bookingLinkSent = true;
      existingJob.secureToken = secureToken;
    } else {
      const newJob = {
        id: `job-${Date.now()}`,
        section: 'Jobs Waiting Booking',
        title: formData.description,
        tenantId: formData.tenantId,
        tenantName: tenant ? tenant.name : 'Valued Resident',
        address: tenant ? tenant.address : 'Property Address',
        description: formData.description,
        durationHours: parseFloat(formData.durationHours) || 1.5,
        assignedStaffId: assignedStaff ? assignedStaff.id : 'ANY',
        assignedStaffName: assignedStaff ? assignedStaff.name : 'Any Available Staff',
        bookingLinkSent: true,
        secureToken,
        createdAt: new Date().toISOString().split('T')[0],
      };
      jobsStore = [newJob, ...jobsStore];
    }

    persistStores();

    const origin = window.location.origin;
    const publicUrl = `${origin}/booking/${secureToken}`;

    const smsMessage = `Hi ${bookingReq.tenantName}, please select a convenient time slot for your maintenance request "${bookingReq.description}" here: ${publicUrl}`;
    const emailMessage = `Dear ${bookingReq.tenantName},\n\nWe have scheduled maintenance for your residence at ${bookingReq.address}.\n\nJob Description: ${bookingReq.description}\nEstimated Duration: ${bookingReq.durationHours} Hours\n\nPlease click the link below to select your preferred booking slot:\n${publicUrl}\n\nThank you,\nAP Maintenance Team`;

    return {
      bookingRequest: bookingReq,
      publicUrl,
      smsMessage,
      emailMessage,
    };
  },

  validateBookingToken: (token) => {
    if (!token) return { valid: false, state: 'INVALID_TOKEN' };

    bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
    const req = bookingRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { valid: false, state: 'INVALID_TOKEN' };

    const todayStr = new Date().toISOString().split('T')[0];
    if (req.expiresAt && req.expiresAt < todayStr && req.status === 'WAITING_FOR_BOOKING') {
      return { valid: false, state: 'EXPIRED_TOKEN', request: req };
    }

    if (req.status === 'REVOKED') {
      return { valid: false, state: 'REVOKED_TOKEN', request: req };
    }

    return { valid: true, state: req.status, request: req };
  },

  getBookingRequestByToken: (token) => {
    return bookingRequestsStore.find((r) => r.secureToken === token);
  },

  getAvailableSlots: (token, selectedDate) => {
    const req = bookingRequestsStore.find((r) => r.secureToken === token);
    if (!req) return [];

    const dateObj = new Date(selectedDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[dateObj.getDay()];

    const durationMins = Math.round(req.durationHours * 60);

    let staffCandidates = [];
    if (req.assignmentPreference === 'ANY') {
      staffCandidates = [...staffStore];
    } else {
      const match = staffStore.find((s) => s.id === req.assignmentPreference);
      if (match) staffCandidates = [match];
      else staffCandidates = [...staffStore];
    }

    let availableSlots = [];

    staffCandidates.forEach((staff) => {
      if (!staff.workingDays || !staff.workingDays.includes(dayName)) return;
      if (staff.unavailable && staff.unavailable.some((u) => u.date === selectedDate)) return;

      const shiftStart = timeToMinutes(staff.workingHours?.start || '08:00');
      const shiftEnd = timeToMinutes(staff.workingHours?.end || '17:00');
      const breakStart = timeToMinutes(staff.breakTime?.start || '12:00');
      const breakEnd = timeToMinutes(staff.breakTime?.end || '13:00');

      const existingBookings = [];

      bookingRequestsStore.forEach((b) => {
        if (
          b.bookingDetails &&
          b.bookingDetails.date === selectedDate &&
          b.bookingDetails.staffId === staff.id &&
          (b.status === 'BOOKED' || b.status === 'RESCHEDULED')
        ) {
          const bStart = timeToMinutes(b.bookingDetails.timeSlot);
          const bEnd = bStart + Math.round(b.durationHours * 60);
          existingBookings.push({ start: bStart, end: bEnd });
        }
      });

      jobsStore.forEach((j) => {
        if (j.scheduledDate === selectedDate && j.assignedStaffId === staff.id && j.scheduledTimeSlot) {
          const parts = j.scheduledTimeSlot.split('-');
          if (parts.length === 2) {
            const startMins = timeToMinutes(parts[0].trim());
            const endMins = timeToMinutes(parts[1].trim());
            existingBookings.push({ start: startMins, end: endMins });
          }
        }
      });

      for (let startMins = shiftStart; startMins + durationMins <= shiftEnd; startMins += 30) {
        const endMins = startMins + durationMins;

        if (endMins > shiftEnd) continue;

        const overlapsBreak = Math.max(startMins, breakStart) < Math.min(endMins, breakEnd);
        if (overlapsBreak) continue;

        const overlapsBooking = existingBookings.some(
          (b) => Math.max(startMins, b.start) < Math.min(endMins, b.end)
        );
        if (overlapsBooking) continue;

        const timeStr = minutesToTime(startMins);
        const endTimeStr = minutesToTime(endMins);

        const exists = availableSlots.some(
          (slot) => slot.timeSlot === timeStr && slot.staffId === staff.id
        );
        if (!exists) {
          availableSlots.push({
            timeSlot: timeStr,
            endTimeSlot: endTimeStr,
            label: `${timeStr} - ${endTimeStr}`,
            durationHours: req.durationHours,
            staffId: staff.id,
            staffName: staff.name,
            staffRole: staff.role,
            color: staff.color,
          });
        }
      }
    });

    return availableSlots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  },

  confirmBooking: (token, selectedDate, timeSlot, staffId) => {
    bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);
    staffStore = loadStore('ap_staff_store', defaultStaff);

    const req = bookingRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { success: false, message: 'Invalid booking request token.' };

    const staff = staffStore.find((s) => s.id === staffId);
    const staffName = staff ? staff.name : 'Assigned Technician';

    req.status = 'BOOKED';
    req.bookingDetails = {
      date: selectedDate,
      timeSlot,
      staffId,
      staffName,
      confirmedAt: new Date().toISOString(),
    };

    const existingJob = jobsStore.find((j) => j.secureToken === token);
    if (existingJob) {
      existingJob.section = 'Jobs';
      existingJob.scheduledDate = selectedDate;
      existingJob.scheduledTimeSlot = `${timeSlot} - ${minutesToTime(timeToMinutes(timeSlot) + Math.round(req.durationHours * 60))}`;
      existingJob.assignedStaffId = staffId;
      existingJob.assignedStaffName = staffName;
    } else {
      jobsStore.push({
        id: `job-${Date.now()}`,
        section: 'Jobs',
        title: req.description,
        tenantId: req.tenantId,
        tenantName: req.tenantName,
        address: req.address,
        description: req.description,
        durationHours: req.durationHours,
        assignedStaffId: staffId,
        assignedStaffName: staffName,
        scheduledDate: selectedDate,
        scheduledTimeSlot: `${timeSlot} - ${minutesToTime(timeToMinutes(timeSlot) + Math.round(req.durationHours * 60))}`,
        secureToken: token,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    persistStores();
    return { success: true, request: req };
  },

  rescheduleBooking: (token, newDate, newTimeSlot, newStaffId) => {
    bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);
    staffStore = loadStore('ap_staff_store', defaultStaff);

    const req = bookingRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { success: false, message: 'Invalid booking request token.' };

    const staff = staffStore.find((s) => s.id === newStaffId);
    const staffName = staff ? staff.name : 'Assigned Technician';

    req.status = 'RESCHEDULED';
    req.bookingDetails = {
      date: newDate,
      timeSlot: newTimeSlot,
      staffId: newStaffId,
      staffName,
      rescheduledAt: new Date().toISOString(),
    };

    const existingJob = jobsStore.find((j) => j.secureToken === token);
    if (existingJob) {
      existingJob.section = 'Jobs';
      existingJob.scheduledDate = newDate;
      existingJob.scheduledTimeSlot = `${newTimeSlot} - ${minutesToTime(timeToMinutes(newTimeSlot) + Math.round(req.durationHours * 60))}`;
      existingJob.assignedStaffId = newStaffId;
      existingJob.assignedStaffName = staffName;
    }

    persistStores();
    return { success: true, request: req };
  },

  cancelBooking: (token, reason = 'Cancelled by resident') => {
    bookingRequestsStore = loadStore('ap_booking_requests_store', defaultBookingRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);

    const req = bookingRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { success: false, message: 'Invalid booking request token.' };

    req.status = 'CANCELLED';
    req.cancellationReason = reason;

    const existingJob = jobsStore.find((j) => j.secureToken === token);
    if (existingJob) {
      existingJob.section = 'Jobs Waiting Booking';
      existingJob.scheduledDate = null;
      existingJob.scheduledTimeSlot = null;
    }

    persistStores();
    return { success: true, request: req };
  },

  // ==========================================
  // PHASE 3: QUOTE PHOTO UPLOAD METHODS
  // ==========================================

  getQuoteRequests: () => {
    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    return [...quoteRequestsStore];
  },

  generateQuoteRequestLink: (formData) => {
    tenantsStore = loadStore('ap_tenants_store', defaultTenants);
    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);

    const tenant = tenantsStore.find((t) => t.id === formData.tenantId);

    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    const secureToken = `tok_q_${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}`;

    const expiryDays = parseInt(formData.linkExpiryDays || '7', 10);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expiryDays);

    const quoteReq = {
      id: `quote-req-${Date.now()}`,
      secureToken,
      tenantId: formData.tenantId,
      tenantName: tenant ? tenant.name : 'Valued Resident',
      address: tenant ? tenant.address : 'Property Address',
      description: formData.description,
      photoInstructions: formData.photoInstructions || 'Please upload photos of the issue.',
      maxPhotos: parseInt(formData.maxPhotos || '5', 10),
      expiryDays,
      expiresAt: expDate.toISOString().split('T')[0],
      internalNotes: formData.internalNotes || '',
      status: 'PHOTO_REQUEST_PENDING',
      photos: [],
      residentComments: '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    quoteRequestsStore = [quoteReq, ...quoteRequestsStore];

    // Add/Ensure entry in jobsStore under 'Quotes'
    const newJob = {
      id: `job-q-${Date.now()}`,
      section: 'Quotes',
      title: formData.description,
      tenantId: formData.tenantId,
      tenantName: tenant ? tenant.name : 'Valued Resident',
      address: tenant ? tenant.address : 'Property Address',
      description: formData.description,
      durationHours: 1.5,
      secureToken,
      createdAt: new Date().toISOString().split('T')[0],
    };
    jobsStore = [newJob, ...jobsStore];

    persistStores();

    const origin = window.location.origin;
    const publicUrl = `${origin}/quote-upload/${secureToken}`;

    const smsMessage = `Hi ${quoteReq.tenantName}, please upload photos for your maintenance request "${quoteReq.description}" here: ${publicUrl}`;
    const emailMessage = `Dear ${quoteReq.tenantName},\n\nTo prepare a maintenance quote for your residence at ${quoteReq.address}, please upload photos of the requested work:\n\nJob: ${quoteReq.description}\nInstructions: ${quoteReq.photoInstructions}\n\nUpload Photos Link:\n${publicUrl}\n\nThank you,\nAP Maintenance Team`;

    return {
      quoteRequest: quoteReq,
      publicUrl,
      smsMessage,
      emailMessage,
    };
  },

  validateQuoteToken: (token) => {
    if (!token) return { valid: false, state: 'INVALID_TOKEN' };

    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    const req = quoteRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { valid: false, state: 'INVALID_TOKEN' };

    const todayStr = new Date().toISOString().split('T')[0];
    if (req.expiresAt && req.expiresAt < todayStr && req.status === 'PHOTO_REQUEST_PENDING') {
      return { valid: false, state: 'EXPIRED_TOKEN', request: req };
    }

    if (req.status === 'QUOTE_CANCELLED') {
      return { valid: false, state: 'CANCELLED_REQUEST', request: req };
    }

    return { valid: true, state: req.status, request: req };
  },

  getQuoteRequestByToken: (token) => {
    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    return quoteRequestsStore.find((r) => r.secureToken === token);
  },

  submitQuotePhotos: (token, photosMetadata, residentComments) => {
    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);

    const req = quoteRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { success: false, message: 'Invalid token.' };

    req.status = 'PHOTOS_RECEIVED';
    req.photos = photosMetadata || [];
    req.residentComments = residentComments || '';
    req.submittedAt = new Date().toISOString();

    // Update job on dashboard (in 'Quotes' section with photos metadata)
    const existingJob = jobsStore.find((j) => j.secureToken === token);
    if (existingJob) {
      existingJob.section = 'Quotes';
      existingJob.photosCount = req.photos.length;
      existingJob.residentComments = residentComments;
    }

    persistStores();

    return { success: true, request: req };
  },

  updateQuoteStatus: (token, newStatus) => {
    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);

    const req = quoteRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { success: false, message: 'Invalid token.' };

    req.status = newStatus;

    // If QUOTE_COMPLETED, move job from 'Quotes' to 'Completed Quotes' on dashboard!
    const existingJob = jobsStore.find((j) => j.secureToken === token);
    if (existingJob) {
      if (newStatus === 'QUOTE_COMPLETED') {
        existingJob.section = 'Completed Quotes';
      } else if (newStatus === 'QUOTE_CANCELLED') {
        existingJob.section = 'Quotes';
      }
    }

    persistStores();
    return { success: true, request: req };
  },

  revokeQuoteToken: (token) => {
    quoteRequestsStore = loadStore('ap_quote_requests_store', defaultQuoteRequests);
    jobsStore = loadStore('ap_jobs_store', defaultJobs);

    const req = quoteRequestsStore.find((r) => r.secureToken === token);
    if (!req) return { success: false, message: 'Invalid token.' };

    req.status = 'QUOTE_CANCELLED';
    persistStores();
    return { success: true, request: req };
  },

  // Inventory & Stock Management Store
  getInventory: () => {
    const defaultList = [
      {
        id: 'inv-1',
        sku: 'SKU-PVC-075',
        name: '3/4" PVC Pipe Fitting & Connector',
        category: 'Plumbing & Leaks',
        stock: 45,
        minStock: 10,
        unitCost: 12.50,
        unit: 'pcs',
        location: 'Central Storage - Aisle 3',
        lastUsedBy: 'Dave Miller (Apt 4B)',
      },
      {
        id: 'inv-2',
        sku: 'SKU-ELE-020',
        name: '20A Circuit Breaker Switch',
        category: 'Electrical & Lighting',
        stock: 18,
        minStock: 5,
        unitCost: 28.00,
        unit: 'pcs',
        location: 'Central Storage - Aisle 1',
        lastUsedBy: 'Sarah Jenkins (Unit 12)',
      },
      {
        id: 'inv-3',
        sku: 'SKU-HVC-100',
        name: 'HVAC Air Filter Replacement (16x25)',
        category: 'HVAC & Air Con',
        stock: 8,
        minStock: 10,
        unitCost: 18.50,
        unit: 'pcs',
        location: 'Central Storage - Aisle 4',
        lastUsedBy: 'Marcus Vance (Suite 3)',
      },
      {
        id: 'inv-4',
        sku: 'SKU-LOCK-55',
        name: 'Heavy Duty Mortise Door Lock Cylinder',
        category: 'Carpentry & Locks',
        stock: 12,
        minStock: 4,
        unitCost: 45.00,
        unit: 'set',
        location: 'Central Storage - Aisle 2',
        lastUsedBy: 'Alex Rivera (Apt 7C)',
      },
      {
        id: 'inv-5',
        sku: 'SKU-FAU-102',
        name: 'Kitchen Pull-Out Faucet Cartridge Replacement',
        category: 'Plumbing & Leaks',
        stock: 24,
        minStock: 6,
        unitCost: 35.00,
        unit: 'pcs',
        location: 'Central Storage - Aisle 3',
        lastUsedBy: 'Dave Miller (Unit 12)',
      },
      {
        id: 'inv-6',
        sku: 'SKU-LED-008',
        name: '15W Dimmable LED Recessed Downlight Bulb',
        category: 'Electrical & Lighting',
        stock: 60,
        minStock: 15,
        unitCost: 8.50,
        unit: 'pcs',
        location: 'Central Storage - Aisle 1',
        lastUsedBy: 'Sarah Jenkins (Apt 1A)',
      },
      {
        id: 'inv-7',
        sku: 'SKU-DRY-300',
        name: 'Heavy Duty Garbage Disposal Unit (1/2 HP)',
        category: 'Appliances & Repairs',
        stock: 6,
        minStock: 3,
        unitCost: 115.00,
        unit: 'unit',
        location: 'Central Storage - Aisle 5',
        lastUsedBy: 'James Park (Unit 12)',
      },
      {
        id: 'inv-8',
        sku: 'SKU-PNT-005',
        name: 'Premium Interior Matte Wall Paint (5 Gallon)',
        category: 'Painting & Drywall',
        stock: 4,
        minStock: 5,
        unitCost: 65.00,
        unit: 'bucket',
        location: 'Central Storage - Aisle 6',
        lastUsedBy: 'Alex Rivera (Apt 4B)',
      },
      {
        id: 'inv-9',
        sku: 'SKU-SMK-202',
        name: 'Smart Dual-Sensor Smoke & Carbon Monoxide Alarm',
        category: 'Electrical & Lighting',
        stock: 32,
        minStock: 8,
        unitCost: 42.00,
        unit: 'pcs',
        location: 'Central Storage - Aisle 1',
        lastUsedBy: 'Sarah Jenkins (Apt 7C)',
      },
      {
        id: 'inv-10',
        sku: 'SKU-SEAL-80',
        name: 'Commercial Silicone Waterproof Caulk Tube (10 oz)',
        category: 'Plumbing & Leaks',
        stock: 50,
        minStock: 12,
        unitCost: 6.75,
        unit: 'tube',
        location: 'Central Storage - Aisle 3',
        lastUsedBy: 'Dave Miller (Apt 1A)',
      },
    ];
    return loadStore('ap_inventory_store_v2', defaultList);
  },

  deductInventoryStock: (itemId, qty = 1, usedByStaff = 'Field Tech') => {
    const defaultList = [
      { id: 'inv-1', sku: 'SKU-PVC-075', name: '3/4" PVC Pipe Fitting', category: 'Plumbing & Leaks', stock: 45, minStock: 10, unitCost: 12.50 },
    ];
    const inv = loadStore('ap_inventory_store_v2', defaultList);
    const item = inv.find((i) => i.id === itemId);
    if (item) {
      item.stock = Math.max(0, item.stock - qty);
      item.lastUsedBy = usedByStaff;
      try {
        localStorage.setItem('ap_inventory_store_v2', JSON.stringify(inv));
      } catch {}
    }
    return inv;
  },

  // Resident Ratings Store
  getRatings: () => {
    return loadStore('ap_ratings_store', [
      {
        id: 'rat-1',
        jobId: 'job-101',
        residentName: 'Robert Fox',
        staffName: 'Dave Miller',
        stars: 5,
        tags: ['Punctual', 'Clean Work', 'Professional'],
        comment: 'Dave arrived on time and fixed the water heater leak within 45 minutes! Left the utility closet sparkling clean.',
        createdAt: '2026-08-05 14:30',
      },
    ]);
  },

  submitResidentRating: (ratingData) => {
    const ratings = loadStore('ap_ratings_store', []);
    // Normalize field names
    const newRating = {
      id: 'rat-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      stars: ratingData.rating || ratingData.stars || 5,
      tags: ratingData.pills || ratingData.tags || [],
      comment: ratingData.comments || ratingData.comment || '',
      jobId: ratingData.jobId,
      residentName: ratingData.residentName,
      staffName: ratingData.staffName,
      token: ratingData.token,
    };
    ratings.unshift(newRating);
    try {
      localStorage.setItem('ap_ratings_store', JSON.stringify(ratings));
    } catch {}
    return { success: true, rating: newRating };
  },
};
