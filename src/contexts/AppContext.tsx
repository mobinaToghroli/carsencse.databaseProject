/**
 * AppContext.tsx — نسخه وصل‌شده به بکند
 *
 * تمام داده‌ها از API واقعی می‌آیند.
 * localStorage فقط توکن نگه می‌دارد، نه داده‌های کاربران.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  authAPI,
  vehicleAPI,
  reportAPI,
  mechanicAPI,
  notificationAPI,
  adminAPI,
  reviewAPI,
  responseAPI,
  attachmentAPI,
  BackendUser,
  BackendVehicle,
  BackendReport,
  BackendMechanic,
  BackendNotification,
} from '../api';

// ─── Types (فرانت محور) ────────────────────────────────────────────────────────
export interface AppUser {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: 'user' | 'mechanic' | 'admin';
  is_active: boolean;
  avatar_url?: string | null;
}

interface AppContextType {
  // State
  currentUser: AppUser | null;
  loading: boolean;
  notificationCount: number;

  // Auth
  login: (identifier: string, password: string, role: 'user' | 'mechanic' | 'admin') => Promise<boolean>;
  logout: () => void;
  register: (data: {
    full_name: string;
    email?: string;
    phone?: string;
    password: string;
    role: 'user' | 'mechanic';
  }) => Promise<boolean>;
  updateUser: (data: { full_name?: string; email?: string; phone?: string; avatar_url?: string }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;

  // Vehicles
  getMyVehicles: () => Promise<BackendVehicle[]>;
  addVehicle: (data: { brand: string; model: string; year: number; color?: string; plate?: string; fuel_type?: string }) => Promise<BackendVehicle | null>;
  updateVehicle: (id: number, data: Partial<BackendVehicle>) => Promise<boolean>;
  deleteVehicle: (id: number) => Promise<boolean>;

  // Reports
  getMyReports: (status?: string) => Promise<BackendReport[]>;
  getAvailableReports: (category?: string) => Promise<BackendReport[]>;
  getMyAssignedReports: (status?: string) => Promise<BackendReport[]>;
  createReport: (data: { 
    vehicle_id: number; 
    title: string; 
    description: string; 
    category: string; 
    priority?: string;
    mechanic_id?: number;
  }) => Promise<BackendReport | null>;
  acceptReport: (id: number) => Promise<boolean>;
  updateReportStatus: (id: number, status: string) => Promise<boolean>;
  cancelReport: (id: number) => Promise<boolean>;

  // Attachments
  uploadAttachment: (reportId: number, file: File) => Promise<boolean>;
  getAttachments: (reportId: number) => Promise<any[]>;

  // Responses
  getResponses: (reportId: number) => Promise<any[]>;
  sendResponse: (reportId: number, data: { message: string; estimated_cost?: number; visit_date?: string }) => Promise<boolean>;

  // Mechanics
  getMechanics: (params?: { city?: string; specialization?: string; min_rating?: number }) => Promise<BackendMechanic[]>;
  getMechanicPublic: (id: number) => Promise<BackendMechanic | null>;
  getMyMechanicProfile: () => Promise<BackendMechanic | null>;
  updateMechanicProfile: (data: { 
    bio?: string; 
    city?: string; 
    years_of_experience?: number; 
    specialization_ids?: number[];
    workshop_name?: string;
    address?: string;
    national_id?: string;
    phone?: string;
    email?: string;
  }) => Promise<boolean>;

  // Reviews
  submitReview: (reportId: number, rating: number, comment?: string) => Promise<boolean>;
  getMechanicReviews: (mechanicId: number) => Promise<any[]>;

  // Notifications
  getNotifications: () => Promise<BackendNotification[]>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotificationCount: () => Promise<void>;

  // Admin
  getAdminStats: () => Promise<any>;
  getPendingMechanics: () => Promise<BackendMechanic[]>;
  verifyMechanic: (id: number) => Promise<boolean>;
  revokeMechanic: (id: number) => Promise<boolean>;
  getAllUsers: (role?: string) => Promise<BackendUser[]>;
  deactivateUser: (id: number) => Promise<boolean>;
  getAllReports: (status?: string) => Promise<BackendReport[]>;
  getSpecializations: () => Promise<any[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // ─── بارگذاری کاربر هنگام شروع ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }

    authAPI.getMe()
      .then(({ data }) => {
        setCurrentUser({
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          is_active: data.is_active,
          avatar_url: data.avatar_url,
        });
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── شمارش نوتیفیکیشن‌های نخوانده ────────────────────────────────────────
  const refreshNotificationCount = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data } = await notificationAPI.unreadCount();
      setNotificationCount(data.unread);
    } catch { /* ignore */ }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    refreshNotificationCount();
    const interval = setInterval(refreshNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser, refreshNotificationCount]);

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const login = async (identifier: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log('🔑 1. Role sent to API:', role);
      
      const data = await authAPI.login(identifier, password);
      console.log('📡 2. Role received from API:', data.role);
      console.log('📡 3. Full API response:', data);
      
      if (data.role !== role) {
        console.log('❌ 4. Role mismatch!', data.role, '!==', role);
        authAPI.logout();
        setCurrentUser(null);
        return false;
      }
      
      const { data: me } = await authAPI.getMe();
      console.log('👤 5. Current user from /me:', me);
      setCurrentUser({
        id: me.id,
        full_name: me.full_name,
        email: me.email,
        phone: me.phone,
        role: me.role,
        is_active: me.is_active,
        avatar_url: me.avatar_url,
      });
      return true;
    } catch (error) {
      console.error('❌ 6. Login error:', error);
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setNotificationCount(0);
  };

  const register = async (data: {
    full_name: string; email?: string; phone?: string;
    password: string; role: 'user' | 'mechanic';
  }): Promise<boolean> => {
    try {
      await authAPI.register(data);
      await login(data.email || data.phone || '', data.password, data.role);
      return true;
    } catch {
      return false;
    }
  };

  const updateUser = async (data: { full_name?: string; email?: string; phone?: string; avatar_url?: string }): Promise<boolean> => {
    try {
      const { data: updated } = await authAPI.updateMe(data);
      setCurrentUser(prev => ({
        ...prev!,
        full_name: updated.full_name || prev!.full_name,
        email: updated.email ?? prev!.email,
        phone: updated.phone ?? prev!.phone,
        avatar_url: updated.avatar_url ?? prev!.avatar_url,
      }));
      return true;
    } catch { return false; }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      return true;
    } catch { return false; }
  };

  // ─── آپلود آواتار ──────────────────────────────────────────────────────────
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const result = await authAPI.uploadAvatar(file);
      
      // ─── دریافت اطلاعات به‌روز شده کاربر ──────────────────────────────────
      const { data: me } = await authAPI.getMe();
      setCurrentUser({
        id: me.id,
        full_name: me.full_name,
        email: me.email,
        phone: me.phone,
        role: me.role,
        is_active: me.is_active,
        avatar_url: me.avatar_url,
      });
      
      return result.avatar_url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  // ─── Vehicles ─────────────────────────────────────────────────────────────
  const getMyVehicles = async () => {
    const { data } = await vehicleAPI.list();
    return data;
  };

  const addVehicle = async (data: any): Promise<BackendVehicle | null> => {
    try {
      const res = await vehicleAPI.create(data);
      return res.data;
    } catch { return null; }
  };

  const updateVehicle = async (id: number, data: any): Promise<boolean> => {
    try { await vehicleAPI.update(id, data); return true; }
    catch { return false; }
  };

  const deleteVehicle = async (id: number): Promise<boolean> => {
    try { await vehicleAPI.delete(id); return true; }
    catch { return false; }
  };

  // ─── Reports ──────────────────────────────────────────────────────────────
  const getMyReports = async (status?: string) => {
    const { data } = await reportAPI.myReports(status);
    return data;
  };

  const getAvailableReports = async (category?: string) => {
    const { data } = await reportAPI.available(category);
    return data;
  };

  const getMyAssignedReports = async (status?: string) => {
    const { data } = await reportAPI.myAssigned(status);
    return data;
  };

  const createReport = async (data: { 
    vehicle_id: number; 
    title: string; 
    description: string; 
    category: string; 
    priority?: string;
    mechanic_id?: number;
  }): Promise<BackendReport | null> => {
    try {
      const res = await reportAPI.create(data);
      return res.data;
    } catch { return null; }
  };

  const acceptReport = async (id: number): Promise<boolean> => {
    try { await reportAPI.accept(id); return true; }
    catch { return false; }
  };

  const updateReportStatus = async (id: number, status: string): Promise<boolean> => {
    try { await reportAPI.updateStatus(id, status); return true; }
    catch { return false; }
  };

  const cancelReport = async (id: number): Promise<boolean> => {
    try { await reportAPI.cancel(id); return true; }
    catch { return false; }
  };

  // ─── Attachments ──────────────────────────────────────────────────────────
  const uploadAttachment = async (reportId: number, file: File): Promise<boolean> => {
    try { await attachmentAPI.upload(reportId, file); return true; }
    catch { return false; }
  };

  const getAttachments = async (reportId: number): Promise<any[]> => {
    try {
      const { data } = await attachmentAPI.list(reportId);
      return data;
    } catch {
      return [];
    }
  };

  // ─── Responses ────────────────────────────────────────────────────────────
  const getResponses = async (reportId: number) => {
    const { data } = await responseAPI.list(reportId);
    return data;
  };

  const sendResponse = async (reportId: number, data: any): Promise<boolean> => {
    try { await responseAPI.send(reportId, data); return true; }
    catch { return false; }
  };

  // ─── Mechanics ────────────────────────────────────────────────────────────
  const getMechanics = async (params?: any) => {
    const { data } = await mechanicAPI.list(params);
    return data;
  };

  const getMechanicPublic = async (id: number): Promise<BackendMechanic | null> => {
    try {
      const { data } = await mechanicAPI.getPublic(id);
      return data;
    } catch { return null; }
  };

  const getMyMechanicProfile = async (): Promise<BackendMechanic | null> => {
    try {
      const { data } = await mechanicAPI.getMyProfile();
      return data;
    } catch { return null; }
  };

  const updateMechanicProfile = async (data: { 
    bio?: string; 
    city?: string; 
    years_of_experience?: number; 
    specialization_ids?: number[];
    workshop_name?: string;
    address?: string;
    national_id?: string;
    phone?: string;
    email?: string;
  }): Promise<boolean> => {
    try { 
      await mechanicAPI.updateMyProfile(data); 
      return true; 
    } catch { 
      return false; 
    }
  };

  // ─── Reviews ──────────────────────────────────────────────────────────────
  const submitReview = async (reportId: number, rating: number, comment?: string): Promise<boolean> => {
    try { await reviewAPI.submit(reportId, rating, comment); return true; }
    catch { return false; }
  };

  const getMechanicReviews = async (mechanicId: number): Promise<any[]> => {
    try {
      const { data } = await reviewAPI.mechanicReviews(mechanicId);
      return data;
    } catch {
      return [];
    }
  };

  // ─── Notifications ────────────────────────────────────────────────────────
  const getNotifications = async () => {
    const { data } = await notificationAPI.list();
    return data;
  };

  const markNotificationRead = async (id: number) => {
    await notificationAPI.markRead(id);
    setNotificationCount((c) => Math.max(0, c - 1));
  };

  const markAllNotificationsRead = async () => {
    await notificationAPI.markAllRead();
    setNotificationCount(0);
  };

  // ─── Admin ────────────────────────────────────────────────────────────────
  const getAdminStats = async () => {
    const { data } = await adminAPI.stats();
    return data;
  };

  const getPendingMechanics = async () => {
    const { data } = await adminAPI.pendingMechanics();
    return data;
  };

  const verifyMechanic = async (id: number): Promise<boolean> => {
    try { await adminAPI.verifyMechanic(id); return true; }
    catch { return false; }
  };

  const revokeMechanic = async (id: number): Promise<boolean> => {
    try { await adminAPI.revokeMechanic(id); return true; }
    catch { return false; }
  };

  const getAllUsers = async (role?: string) => {
    const { data } = await adminAPI.listUsers(role);
    return data;
  };

  const deactivateUser = async (id: number): Promise<boolean> => {
    try { await adminAPI.deactivateUser(id); return true; }
    catch { return false; }
  };

  const getAllReports = async (status?: string) => {
    const { data } = await adminAPI.allReports(status);
    return data;
  };

  // ─── Specializations ──────────────────────────────────────────────────────
  const getSpecializations = async (): Promise<any[]> => {
    try {
      const { data } = await adminAPI.listSpecializations();
      return data;
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-[#94A3B8]">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        currentUser, loading, notificationCount,
        login, logout, register, updateUser, changePassword, uploadAvatar,
        getMyVehicles, addVehicle, updateVehicle, deleteVehicle,
        getMyReports, getAvailableReports, getMyAssignedReports,
        createReport, acceptReport, updateReportStatus, cancelReport,
        uploadAttachment,
        getAttachments,
        getResponses, sendResponse,
        getMechanics, getMechanicPublic, getMyMechanicProfile, updateMechanicProfile,
        submitReview, getMechanicReviews,
        getNotifications, markNotificationRead, markAllNotificationsRead, refreshNotificationCount,
        getAdminStats, getPendingMechanics, verifyMechanic, revokeMechanic,
        getAllUsers, deactivateUser, getAllReports,
        getSpecializations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}