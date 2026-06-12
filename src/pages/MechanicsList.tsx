import { Link } from 'react-router-dom';
import { Award, ChevronLeft, MapPin, Search, Star, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp, BackendMechanic } from '../contexts/AppContext';
import { PublicHeader } from '../components/PublicHeader';

export default function MechanicsList() {
  const { getMechanics } = useApp();
  const [mechanics, setMechanics] = useState<BackendMechanic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMechanics().then(setMechanics).finally(() => setLoading(false));
  }, []);

  const filtered = mechanics.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.city || '').toLowerCase().includes(search.toLowerCase()) ||
    m.specializations.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0F172A]" dir="rtl">
      <PublicHeader onAuthNeeded={() => {}} />
      <main>
        <section className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] py-16">
          <div className="mx-auto max-w-[1200px] px-8 text-center">
            <h1 className="mt-5 text-4xl font-black text-[#F8FAFC]">مکانیک‌های موجود</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">مکانیک مورد نظر را انتخاب کنید و پروفایل عمومی او را ببینید.</p>
            <div className="relative mx-auto mt-8 max-w-lg">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو بر اساس نام، شهر یا تخصص..." className="w-full rounded-2xl border border-[#1E293B] bg-[#1E293B] py-4 pr-11 pl-5 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] placeholder:text-[#94A3B8]" />
            </div>
          </div>
        </section>
        <section className="py-14">
          <div className="mx-auto max-w-[1200px] px-8">
            {loading ? (
              <div className="flex justify-center py-16"><svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-[#1E293B] bg-[#1E293B]/50 py-20 text-center">
                <Wrench className="mx-auto mb-4 h-14 w-14 text-[#3B82F6]/30" />
                <h2 className="text-lg font-bold text-[#F8FAFC]">مکانیکی پیدا نشد</h2>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((m) => (
                  <Link key={m.id} to={`/mechanics/${m.id}`} className="group rounded-3xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-2xl font-black text-white">{m.full_name.charAt(0)}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-[#F8FAFC]">{m.full_name}</h3>
                        <p className="mt-1 text-sm text-[#3B82F6]">{m.specializations.map((s) => s.name).join('، ') || 'تخصص ثبت نشده'}</p>
                        {m.average_rating > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-current" /><span>{m.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 space-y-2 text-sm text-[#94A3B8]">
                      <p className="flex items-center gap-2"><Award className="h-4 w-4 text-[#3B82F6]" />{m.years_of_experience > 0 ? `${m.years_of_experience} سال تجربه` : 'سابقه ثبت نشده'}</p>
                      {m.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#3B82F6]" />{m.city}</p>}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-[#0F172A] pt-4">
                      <span className="text-xs text-[#94A3B8]">پروفایل عمومی</span>
                      <span className="flex items-center gap-1 text-sm font-bold text-[#3B82F6] transition-transform group-hover:-translate-x-1">مشاهده <ChevronLeft className="h-4 w-4" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
