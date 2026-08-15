// Auth context — real JWT authentication via Nexus FMS Backend API
// POST /api/v1/auth/login → stores token + user in localStorage
// GET /api/v1/auth/me → restores and validates session on page reload
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://nexusfmsbackednshrikant-production.up.railway.app/api/v1';
// const API_BASE = 'http://localhost:5000/api/v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while /auth/me is validating the stored token on first load
  const [authLoading, setAuthLoading] = useState(true);

  // ── Restore & validate session from stored JWT on every page load ────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('nexus_token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(formatUser(data.user));
          } else {
            clearStorage(); // Token rejected by server
          }
        } else {
          clearStorage(); // 401 / 403 — token invalid or expired
        }
      } catch {
        // Network failure — don't clear token, leave as unauthenticated
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Login — calls real backend POST /api/v1/auth/login ──────────────────
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    const formatted = formatUser(data.user);
    try {
      localStorage.setItem('nexus_token', data.token);
      localStorage.setItem('nexus_user', JSON.stringify(formatted));
    } catch {
      // Storage unavailable — session is in-memory only
    }

    setUser(formatted);
    return formatted; // Caller uses roleKey to navigate to correct dashboard
  }, []);

  // ── Logout — clears all auth state ──────────────────────────────────────
  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ── Private helpers ───────────────────────────────────────────────────────────

function formatUser(rawUser) {
  let roleKey = '';
  let name = rawUser.full_name || rawUser.name || '';
  
  if (rawUser.role === 'OFFICE_ADMIN') {
    roleKey = 'office-admin';
    name = name || 'Office Admin';
  } else if (rawUser.role === 'OFFICE_TEAM') {
    roleKey = 'office-team';
    name = name || 'Office Team';
  } else {
    roleKey = 'maintenance-staff';
    name = name || 'Maintenance Staff';
  }

  return {
    id: rawUser.id,
    email: rawUser.email,
    name,
    role: rawUser.role,
    roleKey,
  };
}

function clearStorage() {
  try {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('ap_maintenance_user');
    localStorage.removeItem('ap_tenants_store');
    localStorage.removeItem('ap_staff_store');
  } catch {
    // ignore
  }
}
