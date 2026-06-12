import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ReactNode } from 'react';
import { LogOut, Shield, Users, Wrench, FileText, BarChart3, Home, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', label: 'داشبورد', icon: <BarChart3 className="h-4 w-4" /> },
    { path: '/admin/requests', label: 'بررسی درخواست‌ها', icon: <FileText className="h-4 w-4" /> },
    { path: '/admin/mechanics', label: 'تأیید مکانیک‌ها', icon: <Wrench className="h-4 w-4" /> },
    { path: '/admin/users', label: 'مدیریت کاربران', icon: <Users className="h-4 w-4" /> },
    { path: '/admin/settings', label: 'تنظیمات', icon: <Settings className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]" dir="rtl">
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-l border-[#1E293B] bg-[#0F172A]">
        <div className="border-b border-[#1E293B] p-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div><h1 className="text-lg font-black text-[#F8FAFC]">پنل ادمین</h1><p className="text-[10px] text-[#94A3B8]">CarSense</p></div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'}`}>
                {item.icon}<span>{item.label}</span>
              </Link>
            );
          })}
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"><Home className="h-4 w-4" />بازگشت به سایت</Link>
        </nav>

        <div className="border-t border-[#1E293B] p-3">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#1E293B] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-sm font-bold text-white">{currentUser.fullName.charAt(0)}</div>
            <div className="flex-1 overflow-hidden"><p className="truncate text-sm font-semibold text-[#F8FAFC]">{currentUser.fullName}</p><p className="truncate text-xs text-[#94A3B8]">ادمین</p></div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/20"><LogOut className="h-4 w-4" />خروج</button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
