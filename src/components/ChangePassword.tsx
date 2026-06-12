import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';

export function ChangePassword() {
  const { changePassword } = useApp();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!form.current || !form.next) {
      setMsg({ type: 'error', text: 'لطفاً همه فیلدها را پر کنید' });
      return;
    }
    if (form.next.length < 8) {
      setMsg({ type: 'error', text: 'رمز جدید باید حداقل ۸ کاراکتر باشد' });
      return;
    }
    if (form.next !== form.confirm) {
      setMsg({ type: 'error', text: 'رمز جدید و تکرار آن یکسان نیستند' });
      return;
    }

    setSaving(true);
    // changePassword الان async هست و به بکند می‌رود
    const ok = await changePassword(form.current, form.next);
    setSaving(false);

    if (ok) {
      setMsg({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد' });
      setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ type: 'error', text: 'رمز عبور فعلی اشتباه است یا خطایی رخ داد' });
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
        <KeyRound className="h-5 w-5 text-[#3B82F6]" />
        تغییر رمز عبور
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* رمز فعلی */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#94A3B8]">رمز عبور فعلی</label>
          <div className="relative">
            <Lock className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type={show ? 'text' : 'password'}
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] pr-10 pl-10 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              dir="ltr"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#94A3B8] hover:text-white">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* رمز جدید */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#94A3B8]">رمز عبور جدید</label>
          <div className="relative">
            <Lock className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type={show ? 'text' : 'password'}
              value={form.next}
              onChange={(e) => setForm({ ...form, next: e.target.value })}
              placeholder="حداقل ۸ کاراکتر"
              className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] pr-10 pl-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        {/* تکرار رمز جدید */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#94A3B8]">تکرار رمز عبور جدید</label>
          <div className="relative">
            <Lock className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type={show ? 'text' : 'password'}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] pr-10 pl-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${msg.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-[#EF4444]/20 bg-[#EF4444]/5 text-[#EF4444]'}`}>
            {msg.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <span>⚠️</span>}
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          {saving ? 'در حال تغییر...' : 'تغییر رمز عبور'}
        </button>
      </form>
    </div>
  );
}
