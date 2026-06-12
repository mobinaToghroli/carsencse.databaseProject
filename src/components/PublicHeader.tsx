import { Link, useNavigate } from 'react-router-dom';
import { Clock, Phone, Wrench, Menu, X, Shield } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useState } from 'react';

export function PublicHeader({ onAuthNeeded }: { onAuthNeeded?: () => void }) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToPanel = () => {
    if (!currentUser) { onAuthNeeded?.(); return; }
    if (currentUser.role === 'admin') navigate('/admin/dashboard');
    else if (currentUser.role === 'mechanic') navigate('/mechanic/dashboard');
    else navigate('/user/profile');
  };

  const goToRequest = () => {
    if (!currentUser) { onAuthNeeded?.(); return; }
    navigate(currentUser.role === 'mechanic' ? '/mechanic/requests' : '/user/new-request');
  };

  const handleLogout = () => { logout(); navigate('/'); setMobileMenuOpen(false); };

  const isAdmin = currentUser?.role === 'admin';
  const displayName = currentUser?.full_name || '';

  const navItems = isAdmin
    ? [
        { label: 'صفحه اصلی', action: () => navigate('/') },
        { label: 'پنل ادمین', action: () => navigate('/admin/dashboard') },
      ]
    : [
        { label: 'صفحه اصلی', action: () => navigate('/') },
        { label: 'ثبت مشکل', action: goToRequest },
        { label: 'مکانیک‌ها', action: () => navigate('/mechanics') },
        ...(currentUser ? [{ label: currentUser.role === 'mechanic' ? 'پنل مکانیک' : 'پنل کاربر', action: goToPanel }] : []),
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0F172A]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2 lg:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] shadow-lg shadow-[#3B82F6]/20">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl lg:text-2xl font-black text-[#F8FAFC]">CarSense</h1>
            <p className="text-[10px] text-[#94A3B8] -mt-0.5 hidden lg:block">خدمات خرابی خودرو</p>
          </div>
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            {navItems.map((item) => (
              <li key={item.label}>
                <button onClick={item.action} className="hover:text-[#3B82F6] transition-colors">{item.label}</button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 lg:gap-5">
          <div className="hidden lg:flex flex-col text-xs text-[#94A3B8] gap-0.5 items-end">
            <span className="flex items-center gap-1.5">پشتیبانی ۲۴ ساعته <Clock className="h-3.5 w-3.5 text-[#06B6D4]" /></span>
            <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]" dir="ltr">021-12345678 <Phone className="h-3.5 w-3.5 text-[#3B82F6]" /></span>
          </div>

          {currentUser ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link to={isAdmin ? '/admin/dashboard' : currentUser.role === 'mechanic' ? '/mechanic/dashboard' : '/user/profile'}
                className="flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#1E293B] px-4 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all">
                {isAdmin && <Shield className="h-3 w-3" />}{displayName}
              </Link>
              <button onClick={handleLogout} className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/20">خروج</button>
            </div>
          ) : (
            <Link to="/login" className="hidden lg:block rounded-full border border-[#3B82F6]/30 bg-[#1E293B] px-5 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/10">ورود / ثبت‌نام</Link>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden rounded-lg p-2 text-[#94A3B8] hover:bg-[#1E293B]">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1E293B] bg-[#0F172A]">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button key={item.label} onClick={() => { item.action(); setMobileMenuOpen(false); }}
                className="block w-full text-right rounded-xl px-4 py-3 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-white">
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-[#1E293B] mt-3">
              {currentUser ? (
                <button onClick={handleLogout} className="w-full rounded-xl bg-[#EF4444]/10 px-4 py-3 text-sm font-semibold text-[#EF4444]">خروج از حساب</button>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-[#1E293B] px-4 py-3 text-center text-sm font-semibold text-[#3B82F6]">ورود / ثبت‌نام</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
