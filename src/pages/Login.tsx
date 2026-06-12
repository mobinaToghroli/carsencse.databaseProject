import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Wrench, User as UserIcon, Mail, Lock, ArrowRight, Eye, EyeOff, Home, Clock, Phone, Shield, Menu, X } from 'lucide-react';

export default function Login() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'user' | 'mechanic' | 'admin'>('user');
  const [showPass, setShowPass] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const success = await login(formData.email.trim(), formData.password, role);
      if (success) {
        navigate(redirect || (role === 'admin' ? '/admin/dashboard' : role === 'mechanic' ? '/mechanic/dashboard' : '/'));
      } else {
        setError('ایمیل/شماره، رمز عبور یا نقش انتخابی اشتباه است');
      }
    } else {
      if (!formData.fullName.trim()) { setError('لطفاً نام و نام خانوادگی را وارد کنید'); setLoading(false); return; }
      if (!formData.email.trim() && !formData.phone.trim()) { setError('لطفاً ایمیل یا شماره تماس را وارد کنید'); setLoading(false); return; }
      if (formData.password.length < 8) { setError('رمز عبور باید حداقل ۸ کاراکتر باشد'); setLoading(false); return; }
      if (formData.password !== formData.confirmPassword) { setError('رمز عبور و تکرار آن یکسان نیستند'); setLoading(false); return; }
      if (role === 'admin') { setError('ثبت‌نام ادمین مجاز نیست'); setLoading(false); return; }

      const success = await register({
        full_name: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        role: role as 'user' | 'mechanic',
      });
      if (success) { navigate(redirect || '/'); } else { setError('کاربری با این ایمیل یا شماره از قبل وجود دارد'); }
    }
    setLoading(false);
  };

  const switchMode = (newMode: 'login' | 'register') => { setMode(newMode); setError(''); setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' }); };

  return (
    <div className="min-h-screen bg-[#0F172A]" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0F172A]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-2 lg:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]"><Wrench className="h-5 w-5 text-white" /></div>
            <div className="hidden sm:block"><h1 className="text-xl lg:text-2xl font-black text-[#F8FAFC]">CarSense</h1></div>
          </Link>
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
              <li><Link to="/" className="hover:text-[#3B82F6]">صفحه اصلی</Link></li>
              <li><Link to="/mechanics" className="hover:text-[#3B82F6]">مکانیک‌ها</Link></li>
            </ul>
          </nav>
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden lg:flex flex-col text-xs text-[#94A3B8] gap-0.5">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#06B6D4]" />پشتیبانی ۲۴ ساعته</span>
              <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]" dir="ltr"><Phone className="h-3.5 w-3.5 text-[#3B82F6]" />021-12345678</span>
            </div>
            <Link to="/" className="hidden lg:flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#06B6D4]"><Home className="h-4 w-4" />صفحه اصلی</Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden rounded-lg p-2 text-[#94A3B8] hover:bg-[#1E293B]">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1E293B] bg-[#0F172A]">
            <div className="px-4 py-4 space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-white">صفحه اصلی</Link>
              <Link to="/mechanics" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-white">مکانیک‌ها</Link>
            </div>
          </div>
        )}
      </header>

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] shadow-lg shadow-[#3B82F6]/20"><Shield className="h-8 w-8 text-white" /></div>
            <h1 className="text-3xl font-bold text-[#F8FAFC]">CarSense</h1>
            <p className="mt-2 text-sm text-[#94A3B8]">سامانه مدیریت خرابی خودرو</p>
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 lg:p-8 shadow-xl">
            <div className="mb-6 flex rounded-xl bg-[#0F172A] p-1">
              <button type="button" onClick={() => switchMode('login')} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${mode === 'login' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-[#94A3B8]'}`}>ورود</button>
              <button type="button" onClick={() => switchMode('register')} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${mode === 'register' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-[#94A3B8]'}`}>ثبت‌نام</button>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-xs font-medium text-[#94A3B8]">{mode === 'login' ? 'ورود به عنوان' : 'ثبت‌نام به عنوان'}</p>
              <div className={`grid gap-2 ${mode === 'register' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <button type="button" onClick={() => setRole('user')} className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${role === 'user' ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#1E293B] text-[#94A3B8]'}`}><UserIcon className="h-5 w-5" />کاربر</button>
                <button type="button" onClick={() => setRole('mechanic')} className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${role === 'mechanic' ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#1E293B] text-[#94A3B8]'}`}><Wrench className="h-5 w-5" />مکانیک</button>
                {mode === 'login' && <button type="button" onClick={() => setRole('admin')} className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${role === 'admin' ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#1E293B] text-[#94A3B8]'}`}><Shield className="h-5 w-5" />ادمین</button>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">نام و نام خانوادگی <span className="text-[#EF4444]">*</span></label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="علی محمدی" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" /></div>
              )}

              {mode === 'login' ? (
                <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">ایمیل یا شماره تماس <span className="text-[#EF4444]">*</span></label>
                <div className="relative"><Mail className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <input type="text" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com یا 09xxxxxxxxx" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] pr-10 pl-4 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" dir="ltr" /></div></div>
              ) : (
                <>
                  <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">ایمیل</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" dir="ltr" /></div>
                  <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">شماره تماس <span className="text-[#EF4444]">*</span></label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="09xxxxxxxxx" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" dir="ltr" /></div>
                </>
              )}

              <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">رمز عبور <span className="text-[#EF4444]">*</span></label>
              <div className="relative"><Lock className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input type={showPass ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] pr-10 pl-10 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" dir="ltr" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div></div>

              {mode === 'register' && (
                <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">تکرار رمز عبور <span className="text-[#EF4444]">*</span></label>
                <input type={showPass ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" dir="ltr" /></div>
              )}

              {error && <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]"><span>⚠️</span>{error}</div>}

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60 active:scale-95">
                {loading ? (<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>) : (<>{mode === 'login' ? 'ورود' : 'ثبت‌نام'}<ArrowRight className="h-4 w-4" /></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
