import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ReactNode } from 'react';
import { LogOut, Wrench } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isMechanic = currentUser?.role === 'mechanic';

  const userMenuItems = [
    { path: '/', label: 'صفحه اصلی', icon: '🏠' },
    { path: '/mechanics', label: 'مکانیک‌ها', icon: '🔧' },
    { path: '/user/new-request', label: 'ثبت خرابی جدید', icon: '🚗' },
    { path: '/user/profile', label: 'اطلاعات شخصی', icon: '👤' },
    { path: '/user/vehicles', label: 'مشخصات خودرو', icon: '🚙' },
    { path: '/user/history', label: 'تاریخچه درخواست‌ها', icon: '🕘' },
  ];

  const mechanicMenuItems = [
    { path: '/', label: 'صفحه اصلی', icon: '🏠' },
    { path: '/mechanic/dashboard', label: 'داشبورد', icon: '📊' },
    { path: '/mechanic/requests', label: 'درخواست‌ها', icon: '📋' },
    { path: '/mechanic/profile', label: 'پروفایل', icon: '👤' },
    { path: '/mechanic/history', label: 'تاریخچه خدمات', icon: '🕘' },
  ];

  const menuItems = isMechanic ? mechanicMenuItems : userMenuItems;

  // ─── آواتار کاربر ──────────────────────────────────────────────────────────
  const avatarUrl = currentUser?.avatar_url 
    ? `http://localhost:8000${currentUser.avatar_url}` 
    : null;

  return (
    <div className="flex min-h-screen bg-[#0F172A]" dir="rtl">
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-l border-[#1E293B] bg-[#0F172A]">
        <div className="border-b border-[#1E293B] p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] shadow-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#F8FAFC]">CarSense</h1>
              <p className="text-[10px] text-[#94A3B8]">{isMechanic ? 'پنل مکانیک' : 'پنل کاربر'}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path + item.label} to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                }`}>
                <span className="text-lg">{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>

        {currentUser && (
          <div className="border-t border-[#1E293B] p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#1E293B] p-3">
              {/* ─── آواتار ─── */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={currentUser.full_name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-[#3B82F6]"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-sm font-bold text-white">
                  {(currentUser.full_name || '?').charAt(0)}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-[#F8FAFC]">{currentUser.full_name}</p>
                <p className="truncate text-xs text-[#94A3B8]">{isMechanic ? 'مکانیک' : 'کاربر عادی'}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/20 active:scale-95">
              <LogOut className="h-4 w-4" />خروج از حساب
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}