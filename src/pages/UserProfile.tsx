import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Save, CheckCircle } from 'lucide-react';
import { ChangePassword } from '../components/ChangePassword';

export default function UserProfile() {
  const { currentUser, updateUser } = useApp();

  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // ✅ updateUser الان async هست و به بکند می‌رود
    const ok = await updateUser({
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim() || undefined,
    });

    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('خطا در ذخیره اطلاعات. دوباره تلاش کنید.');
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">اطلاعات شخصی</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">ویرایش اطلاعات حساب کاربری</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 lg:p-8">

            {/* آواتار */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-2xl font-bold text-white shadow-lg shadow-[#3B82F6]/20">
                {/* ✅ full_name به جای fullName */}
                {(currentUser?.full_name || '?').charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentUser?.full_name || 'کاربر'}</h2>
                <span className="mt-1 inline-flex rounded-full bg-[#3B82F6]/10 px-3 py-0.5 text-xs font-medium text-[#3B82F6]">
                  {currentUser?.role === 'mechanic' ? 'مکانیک' : currentUser?.role === 'admin' ? 'ادمین' : 'کاربر عادی'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* نام */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white transition-colors focus:border-[#3B82F6] focus:outline-none"
                  required
                />
              </div>

              {/* ایمیل — فقط نمایش */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">ایمیل</label>
                <input
                  type="email"
                  value={currentUser?.email || '—'}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-[#1E293B] bg-[#0F172A]/50 px-4 py-2.5 text-sm text-[#94A3B8]"
                />
                <p className="mt-1 text-xs text-[#94A3B8]/60">ایمیل قابل تغییر نیست</p>
              </div>

              {/* موبایل */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">شماره موبایل</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xxxxxxxxx"
                  dir="ltr"
                  className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] transition-colors focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              {/* پیام موفقیت */}
              {saved && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />اطلاعات با موفقیت ذخیره شد
                </div>
              )}

              {/* پیام خطا */}
              {error && (
                <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-3 text-sm text-[#EF4444]">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </form>
          </div>

          {/* تغییر رمز عبور */}
          <ChangePassword />
        </div>
      </div>
    </Layout>
  );
}
