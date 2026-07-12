/**
 * api/index.ts — لایه ارتباط با بکند FastAPI
 * 
 * همه mock‌های قبلی با call واقعی به /api/v1 جایگزین شدند.
 * فقط VITE_API_URL را در .env تنظیم کن.
 */

import axios from 'axios';

// ─── Base URL ─────────────────────────────────────────────────────────────────
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Inject access token روی هر request ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── اگر 401 گرفتیم، refresh کن وگرنه logout ─────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Types (همسو با بکند) ─────────────────────────────────────────────────────
export interface BackendUser {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: 'user' | 'mechanic' | 'admin';
  is_active: boolean;
  created_at: string;
  avatar_url?: string | null;  // ← اضافه شد
}

export interface BackendVehicle {
  id: number;
  owner_id: number;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  plate: string | null;
  fuel_type: string;
  display_name: string;
}

export interface BackendReport {
  id: number;
  user_id: number;
  vehicle_id: number;
  assigned_mechanic_id: number | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BackendMechanic {
  id: number;
  user_id: number;
  full_name: string;
  bio: string | null;
  city: string | null;
  years_of_experience: number;
  is_verified: boolean;
  total_completed: number;
  average_rating: number;
  specializations: { id: number; name: string; slug: string }[];
  
  // ─── فیلدهای جدید برای اطلاعات کامل مکانیک ──────────────────────────────
  workshop_name?: string | null;
  address?: string | null;
  national_id?: string | null;
  user?: {
    phone: string | null;
    email: string | null;
    full_name: string;
    avatar_url?: string | null;  // ← اضافه شد
  };
}

export interface BackendResponse {
  id: number;
  report_id: number;
  sender_id: number;
  message: string;
  estimated_cost: number | null;
  estimated_duration: number | null;
  visit_date: string | null;
  created_at: string;
}

export interface BackendNotification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  report_id: number | null;
  created_at: string;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  /** ثبت‌نام */
  register: (data: {
    full_name: string;
    email?: string;
    phone?: string;
    password: string;
    role: 'user' | 'mechanic';
  }) => api.post('/auth/register', data),

  /** ورود — توکن‌ها رو در localStorage ذخیره می‌کنه */
  login: async (identifier: string, password: string) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', String(data.user_id));
    return data as {
      access_token: string;
      refresh_token: string;
      role: string;
      user_id: number;
      full_name: string;
    };
  },

  /** خروج */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
  },

  /** پروفایل من */
  getMe: () => api.get<BackendUser>('/auth/me'),

  /** ویرایش اطلاعات */
  updateMe: (data: { full_name?: string; email?: string; phone?: string; avatar_url?: string }) =>
    api.patch<BackendUser>('/auth/me', data),

  /** تغییر رمز */
  changePassword: (old_password: string, new_password: string) =>
    api.post('/auth/me/change-password', { old_password, new_password }),

  /** آپلود آواتار */  // ← اضافه شد
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/auth/me/upload-avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as { detail: string; avatar_url: string };
  },
};

// ─── VEHICLES ─────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  list: () => api.get<BackendVehicle[]>('/vehicles'),

  create: (data: {
    brand: string;
    model: string;
    year: number;
    color?: string;
    plate?: string;
    fuel_type?: string;
  }) => api.post<BackendVehicle>('/vehicles', data),

  update: (id: number, data: Partial<BackendVehicle>) =>
    api.patch<BackendVehicle>(`/vehicles/${id}`, data),

  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

// ─── REPORTS (مشکلات) ─────────────────────────────────────────────────────────
export const reportAPI = {
  /** تاریخچه کاربر */
  myReports: (status?: string) =>
    api.get<BackendReport[]>('/reports/my', { params: status ? { status } : {} }),

  /** درخواست‌های در انتظار برای مکانیک */
  available: (category?: string) =>
    api.get<BackendReport[]>('/reports/available', {
      params: category ? { category } : {},
    }),

  /** کارهای assigned مکانیک */
  myAssigned: (status?: string) =>
    api.get<BackendReport[]>('/reports/my-assigned', {
      params: status ? { status } : {},
    }),

  /** ثبت مشکل جدید */
  create: (data: {
    vehicle_id: number;
    title: string;
    description: string;
    category: string;
    priority?: string;
    mechanic_id?: number;
  }) => api.post<BackendReport>('/reports', data),

  /** جزئیات */
  get: (id: number) => api.get<BackendReport>(`/reports/${id}`),

  /** قبول توسط مکانیک */
  accept: (id: number) => api.post(`/reports/${id}/accept`),

  /** تغییر وضعیت */
  updateStatus: (id: number, status: string) =>
    api.patch(`/reports/${id}/status`, { status }),

  /** لغو توسط کاربر */
  cancel: (id: number) => api.post(`/reports/${id}/cancel`),
};

// ─── ATTACHMENTS (تصویر / صدا) ───────────────────────────────────────────────
export const attachmentAPI = {
  upload: (reportId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/reports/${reportId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  list: (reportId: number) =>
    api.get<
      { id: number; file_name: string; file_type: string; file_size: number; created_at: string }[]
    >(`/reports/${reportId}/attachments`),

  delete: (reportId: number, attachmentId: number) =>
    api.delete(`/reports/${reportId}/attachments/${attachmentId}`),

  /** URL مستقیم برای نمایش فایل */
  url: (reportId: number, attachmentId: number) =>
    `${API_BASE_URL.replace('/api/v1', '')}/uploads/${reportId}/${attachmentId}`,
};

// ─── RESPONSES (گفتگو) ────────────────────────────────────────────────────────
export const responseAPI = {
  list: (reportId: number) =>
    api.get<BackendResponse[]>(`/reports/${reportId}/responses`),

  send: (
    reportId: number,
    data: {
      message: string;
      estimated_cost?: number;
      estimated_duration?: number;
      visit_date?: string;
    }
  ) => api.post<BackendResponse>(`/reports/${reportId}/responses`, data),
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export const reviewAPI = {
  submit: (reportId: number, rating: number, comment?: string) =>
    api.post(`/reports/${reportId}/review`, { rating, comment }),

  mechanicReviews: (mechanicId: number) =>
    api.get(`/mechanics/${mechanicId}/reviews`),
};

// ─── MECHANICS ───────────────────────────────────────────────────────────────
export const mechanicAPI = {
  /** لیست عمومی مکانیک‌ها با فیلتر */
  list: (params?: { city?: string; specialization?: string; min_rating?: number }) =>
    api.get<BackendMechanic[]>('/mechanics', { params }),

  /** پروفایل عمومی */
  getPublic: (id: number) => api.get<BackendMechanic>(`/mechanics/${id}`),

  /** پروفایل خودم (مکانیک) */
  getMyProfile: () => api.get<BackendMechanic>('/mechanics/me/profile'),

  /** ویرایش پروفایل */
  updateMyProfile: (data: {
    bio?: string;
    city?: string;
    years_of_experience?: number;
    specialization_ids?: number[];
    workshop_name?: string;
    address?: string;
    national_id?: string;
    phone?: string;
    email?: string;
  }) => api.patch<BackendMechanic>('/mechanics/me/profile', data),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationAPI = {
  list: () => api.get<BackendNotification[]>('/notifications'),
  unreadCount: () => api.get<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () =>
    api.get<{
      total_users: number;
      total_mechanics: number;
      verified_mechanics: number;
      pending_mechanics: number;
      total_reports: number;
      pending_reports: number;
      completed_reports: number;
    }>('/admin/stats'),

  pendingMechanics: () => api.get<BackendMechanic[]>('/admin/mechanics/pending'),
  verifyMechanic: (id: number) => api.post(`/admin/mechanics/${id}/verify`),
  revokeMechanic: (id: number) => api.post(`/admin/mechanics/${id}/revoke`),

  listUsers: (role?: string) =>
    api.get<BackendUser[]>('/admin/users', { params: role ? { role } : {} }),
  deactivateUser: (id: number) => api.post(`/admin/users/${id}/deactivate`),

  allReports: (status?: string) =>
    api.get<BackendReport[]>('/admin/reports', {
      params: status ? { status } : {},
    }),

  listSpecializations: () => api.get('/admin/specializations'),
  createSpecialization: (name: string, slug: string) =>
    api.post('/admin/specializations', { name, slug }),
  deleteSpecialization: (id: number) => api.delete(`/admin/specializations/${id}`),
};

// ─── ABOUT / FOOTER ───────────────────────────────────────────────────────────
export const aboutAPI = {
  get: (key: string) => api.get(`/about/${key}`),
  list: () => api.get('/about'),
  update: (key: string, title: string, body: string) =>
    api.put(`/about/${key}`, { title, body }),
};

export default api;