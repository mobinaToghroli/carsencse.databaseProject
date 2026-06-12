import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Save, Wrench, Award, CheckCircle } from 'lucide-react';
import { ChangePassword } from '../components/ChangePassword';

export default function MechanicProfilePage() {
  const { getMyMechanicProfile, updateMechanicProfile } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({ bio: '', city: '', years_of_experience: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyMechanicProfile().then((p) => {
      if (p) {
        setProfile(p);
        setFormData({ bio: p.bio || '', city: p.city || '', years_of_experience: p.years_of_experience || 0 });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateMechanicProfile({
      bio: formData.bio,
      city: formData.city,
      years_of_experience: formData.years_of_experience,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    getMyMechanicProfile().then(setProfile);
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6"><h1 className="text-2xl font-black text-white">پروفایل مکانیک</h1><p className="mt-1 text-sm text-[#94A3B8]">اطلاعات حرفه‌ای خود را کامل کنید</p></div>

        {profile && !profile.is_verified && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <span className="text-xl">⏳</span>
            <div><p className="text-sm font-semibold text-amber-400">در انتظار تأیید ادمین</p><p className="text-xs text-[#94A3B8] mt-0.5">پروفایل شما پس از بررسی فعال خواهد شد.</p></div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-3xl font-bold text-white">{profile?.full_name?.charAt(0) || '?'}</div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name || '...'}</h2>
              {profile?.average_rating > 0 && <div className="mt-3 flex items-center justify-center gap-1 text-amber-400"><Award className="h-4 w-4" /><span className="text-sm font-medium">{profile.average_rating.toFixed(1)} / ۵</span></div>}
              {profile?.total_completed > 0 && <p className="mt-2 text-sm text-[#94A3B8]">{profile.total_completed} تعمیر تکمیل شده</p>}
              {profile?.is_verified && <span className="mt-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">✓ تأیید شده</span>}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white"><Wrench className="h-5 w-5 text-[#3B82F6]" />ویرایش اطلاعات</h3>
              <div className="space-y-4">
                <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">شهر محل کار</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="تهران" className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>

                <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">سال‌های تجربه</label>
                <input type="number" min={0} max={60} value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" /></div>

                <div><label className="mb-1 block text-sm font-medium text-[#94A3B8]">درباره من</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="توضیح درباره تجربه و تخصص..." className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none resize-none" /></div>

                {saved && <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400"><CheckCircle className="h-4 w-4" />اطلاعات ذخیره شد</div>}
                <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white disabled:opacity-60">
                  <Save className="h-4 w-4" />{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
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
