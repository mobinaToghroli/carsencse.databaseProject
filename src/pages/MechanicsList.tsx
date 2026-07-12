import { Link } from 'react-router-dom';
import { Award, ChevronLeft, MapPin, Search, Star, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BackendMechanic } from '../api';
import { PublicHeader } from '../components/PublicHeader';

export default function MechanicsList() {
  const { getMechanics } = useApp();
  const [mechanics, setMechanics] = useState<BackendMechanic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    getMechanics().then(setMechanics).finally(() => setLoading(false));
  }, []);

  // ─── تابع ساخت URL آواتار ──────────────────────────────────────────────────
  const getAvatarUrl = (mechanic: BackendMechanic) => {
    const avatar = mechanic.user?.avatar_url || (mechanic as any)?.avatar_url;
    if (avatar) {
      return `http://localhost:8000${avatar}`;
    }
    return null;
  };

  const filtered = mechanics.filter((m) => {
    const text = `${m.full_name} ${m.city || ''} ${m.specializations.map((s) => s.name).join(' ')}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#0F172A]" dir="rtl">
      <PublicHeader onAuthNeeded={() => setShowLoginPrompt(true)} />

      <main>
        {/* ─── Hero ─── */}
        <section className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] py-16">
          <div className="mx-auto max-w-[1200px] px-8 text-center">
            <span className="inline-flex rounded-full border border-[#3B82F6]/30 bg-[#1E293B] px-5 py-2 text-xs font-semibold text-[#3B82F6]">
              مکانیک‌های تأییدشده در CarSense
            </span>
            <h1 className="mt-5 text-4xl font-black text-[#F8FAFC]">انتخاب مکانیک</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
              مکانیک مورد نظر خود را انتخاب کنید، پروفایل عمومی او را ببینید و درخواست خرابی خودرو ثبت کنید.
            </p>
            <div className="relative mx-auto mt-8 max-w-lg">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو بر اساس نام، شهر یا تخصص..."
                className="w-full rounded-2xl border border-[#1E293B] bg-[#1E293B] py-4 pr-11 pl-5 text-sm text-[#F8FAFC] outline-none transition-all focus:border-[#3B82F6] placeholder:text-[#94A3B8]" />
            </div>
          </div>
        </section>

        {/* ─── لیست مکانیک‌ها ─── */}
        <section className="py-14">
          <div className="mx-auto max-w-[1200px] px-8">
            {loading ? (
              <div className="flex justify-center py-16">
                <svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-[#1E293B] bg-[#1E293B]/50 py-20 text-center">
                <Wrench className="mx-auto mb-4 h-14 w-14 text-[#3B82F6]/30" />
                <h2 className="text-lg font-bold text-[#F8FAFC]">
                  {mechanics.length === 0 ? 'هنوز مکانیکی ثبت نشده است' : 'مکانیکی با این مشخصات پیدا نشد'}
                </h2>
                <p className="mt-2 text-sm text-[#94A3B8]">
                  {mechanics.length === 0
                    ? 'مکانیک‌هایی که ثبت‌نام و تأیید شوند در این لیست نمایش داده می‌شوند'
                    : 'عبارت جستجو را تغییر دهید'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((m) => {
                  const avatarUrl = getAvatarUrl(m);
                  return (
                    <Link key={m.id} to={`/mechanics/${m.id}`}
                      className="group rounded-3xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/5">
                      <div className="flex items-start gap-4">
                        {/* ─── آواتار ─── */}
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={m.full_name}
                            className="h-16 w-16 rounded-2xl object-cover border-2 border-[#3B82F6] flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-2xl font-black text-white shadow-lg shadow-[#3B82F6]/20">
                            {m.full_name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-black text-[#F8FAFC]">{m.full_name}</h3>
                          <p className="mt-1 truncate text-sm text-[#3B82F6]">
                            {m.specializations.map((s) => s.name).join(' · ') || 'تخصص ثبت نشده'}
                          </p>
                          {m.average_rating > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(m.average_rating) ? 'fill-current' : ''}`} />
                              ))}
                              <span className="mr-1 text-[#94A3B8]">{m.average_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 text-sm text-[#94A3B8]">
                        <p className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-[#3B82F6]" />
                          {m.years_of_experience > 0 ? `${m.years_of_experience} سال تجربه` : 'سابقه کاری ثبت نشده'}
                        </p>
                        {m.city && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#3B82F6]" />{m.city}
                          </p>
                        )}
                        {m.total_completed > 0 && (
                          <p className="flex items-center gap-2">
                            <span className="h-4 w-4 text-center text-[#3B82F6]">✓</span>
                            {m.total_completed} تعمیر تکمیل شده
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-[#0F172A] pt-4">
                        <span className="text-xs text-[#94A3B8]">پروفایل عمومی</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-[#3B82F6] transition-transform group-hover:-translate-x-1">
                          مشاهده <ChevronLeft className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── سوالات متداول ─── */}
        <section className="bg-[#1E293B]/30 py-16">
          <div className="mx-auto max-w-[1000px] px-8">
            <h2 className="text-center text-3xl font-black text-[#F8FAFC]">سوالات متداول</h2>
            <div className="mt-10 space-y-4">
              {[
                ['چطور مکانیک انتخاب کنم؟', 'از لیست مکانیک‌ها روی پروفایل مکانیک کلیک کنید و سپس گزینه ثبت درخواست را بزنید.'],
                ['آیا درخواست من برای همه مکانیک‌ها می‌رود؟', 'خیر. از صفحه ثبت مشکل عمومی، درخواست برای همه مکانیک‌های آزاد نمایش داده می‌شود.'],
                ['آیا لیست مکانیک‌ها نیاز به تأیید دارد؟', 'بله. فقط مکانیک‌هایی که توسط ادمین تأیید شده باشند در این لیست نمایش داده می‌شوند.'],
                ['اگر مکانیک پروفایلش کامل نباشد چه می‌شود؟', 'در لیست نمایش داده می‌شود اما اطلاعات تخصص و آدرس تا زمانی که خودش تکمیل کند خالی می‌ماند.'],
              ].map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-[#1E293B] bg-[#1E293B] p-5 shadow-sm">
                  <summary className="cursor-pointer list-none text-base font-bold text-[#F8FAFC]">{q}</summary>
                  <p className="mt-3 text-sm leading-7 text-[#94A3B8]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Modal ورود ─── */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLoginPrompt(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#1E293B] bg-[#1E293B] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
              <Wrench className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">ابتدا وارد حساب شوید</h3>
            <p className="mt-2 text-sm leading-7 text-[#94A3B8]">برای ثبت درخواست باید وارد شوید یا حساب کاربری بسازید.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/login" className="flex-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-center text-sm font-bold text-white">ورود</Link>
              <button onClick={() => setShowLoginPrompt(false)} className="flex-1 rounded-xl border border-[#1E293B] bg-[#0F172A] py-3 text-sm font-bold text-[#94A3B8]">بعداً</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}