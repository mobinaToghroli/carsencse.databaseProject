import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Save, Wrench, Award, CheckCircle, Phone, Mail, MapPin, Building, User, Camera } from 'lucide-react';
import { ChangePassword } from '../components/ChangePassword';

export default function MechanicProfilePage() {
  const { getMyMechanicProfile, updateMechanicProfile, currentUser, getSpecializations, uploadAvatar } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    bio: '',
    city: '',
    years_of_experience: 0,
    workshop_name: '',
    address: '',
    national_id: '',
    phone: '',
    email: '',
    specialization_ids: [] as number[],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── دریافت پروفایل و تخصص‌ها ──────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const [p, specs] = await Promise.all([
        getMyMechanicProfile(),
        getSpecializations()
      ]);
      
      if (p) {
        setProfile(p);
        setSpecializations(specs || []);
        setFormData({
          bio: p.bio || '',
          city: p.city || '',
          years_of_experience: p.years_of_experience || 0,
          workshop_name: p.workshop_name || '',
          address: p.address || '',
          national_id: p.national_id || '',
          phone: currentUser?.phone || '',
          email: currentUser?.email || '',
          specialization_ids: p.specializations?.map((s: any) => s.id) || [],
        });
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateMechanicProfile({
      bio: formData.bio,
      city: formData.city,
      years_of_experience: formData.years_of_experience,
      workshop_name: formData.workshop_name,
      address: formData.address,
      national_id: formData.national_id,
      phone: formData.phone,
      email: formData.email,
      specialization_ids: formData.specialization_ids,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // ─── reload کردن پروفایل ──────────────────────────────────────────────
    getMyMechanicProfile().then((p) => {
      if (p) {
        setProfile(p);
        setFormData(prev => ({
          ...prev,
          bio: p.bio || '',
          city: p.city || '',
          years_of_experience: p.years_of_experience || 0,
          workshop_name: p.workshop_name || '',
          address: p.address || '',
          national_id: p.national_id || '',
          specialization_ids: p.specializations?.map((s: any) => s.id) || [],
        }));
      }
    });
  };

  const toggleSpecialization = (id: number) => {
    setFormData(prev => {
      const current = prev.specialization_ids || [];
      if (current.includes(id)) {
        return { ...prev, specialization_ids: current.filter(s => s !== id) };
      } else {
        return { ...prev, specialization_ids: [...current, id] };
      }
    });
  };

  // ─── آپلود آواتار ──────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const avatarUrl = await uploadAvatar(file);
    setUploading(false);

    if (avatarUrl) {
      // ─── به‌روزرسانی profile با آواتار جدید ──────────────────────────────
      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      // ─── currentUser توی AppContext خودش به‌روز میشه ──────────────────────
    } else {
      alert('خطا در آپلود آواتار');
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return `http://localhost:8000${profile.avatar_url}`;
    }
    return null;
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">پروفایل مکانیک</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">اطلاعات حرفه‌ای خود را کامل کنید</p>
        </div>

        {profile && !profile.is_verified && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <span className="text-xl">⏳</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">در انتظار تأیید ادمین</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">پروفایل شما پس از بررسی فعال خواهد شد.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ─── سایدبار با آواتار ─── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 text-center">
              <div className="relative mx-auto w-24 h-24">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl() ?? undefined}
                    alt={profile?.full_name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#3B82F6]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-3xl font-bold text-white">
                    {profile?.full_name?.charAt(0) || '?'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#3B82F6] p-2 hover:bg-[#2563EB] transition-colors shadow-lg">
                  {uploading ? (
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <h2 className="mt-4 text-xl font-bold text-white">{profile?.full_name || '...'}</h2>
              {profile?.average_rating > 0 && (
                <div className="mt-3 flex items-center justify-center gap-1 text-amber-400">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">{profile.average_rating.toFixed(1)} / ۵</span>
                </div>
              )}
              {profile?.total_completed > 0 && (
                <p className="mt-2 text-sm text-[#94A3B8]">{profile.total_completed} تعمیر تکمیل شده</p>
              )}
              {profile?.is_verified && (
                <span className="mt-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">✓ تأیید شده</span>
              )}
            </div>
          </div>

          {/* ─── فرم ─── */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                <Wrench className="h-5 w-5 text-[#3B82F6]" />
                ویرایش اطلاعات
              </h3>
              
              <div className="space-y-4">
                {/* ─── اطلاعات تماس ─── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      <Phone className="inline h-4 w-4 ml-1" />
                      تلفن
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="09123456789"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      <Mail className="inline h-4 w-4 ml-1" />
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* ─── اطلاعات تعمیرگاه ─── */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                    <Building className="inline h-4 w-4 ml-1" />
                    نام تعمیرگاه
                  </label>
                  <input
                    type="text"
                    value={formData.workshop_name}
                    onChange={(e) => setFormData({ ...formData, workshop_name: e.target.value })}
                    placeholder="تعمیرگاه مرکزی"
                    className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                    <MapPin className="inline h-4 w-4 ml-1" />
                    آدرس
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="تهران، خیابان ..."
                    className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* ─── اطلاعات شخصی ─── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      <User className="inline h-4 w-4 ml-1" />
                      کد ملی
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      placeholder="1234567890"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">شهر محل کار</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="تهران"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#94A3B8]">سال‌های تجربه</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* ─── انتخاب تخصص ─── */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#94A3B8]">
                    تخصص‌ها
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => toggleSpecialization(spec.id)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                          (formData.specialization_ids || []).includes(spec.id)
                            ? 'bg-[#3B82F6] text-white'
                            : 'bg-[#0F172A] text-[#94A3B8] hover:bg-[#1E293B]'
                        }`}
                      >
                        {spec.name}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#94A3B8]/60">چند تخصص قابل انتخاب است</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#94A3B8]">درباره من</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="توضیح درباره تجربه و تخصص..."
                    className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none resize-none"
                  />
                </div>

                {saved && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
                    <CheckCircle className="h-4 w-4" />اطلاعات ذخیره شد
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>

            <ChangePassword />
          </div>
        </div>
      </div>
    </Layout>
  );
}