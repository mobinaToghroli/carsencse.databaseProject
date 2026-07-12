import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Award, ChevronLeft, MapPin, Star, Wrench, X, Shield } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BackendMechanic } from '../api';
import { PublicHeader } from '../components/PublicHeader';

export default function MechanicPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMechanicPublic, currentUser, getMechanicReviews } = useApp();
  const [mechanic, setMechanic] = useState<BackendMechanic | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMechanicPublic(parseInt(id)).then((m) => {
      setMechanic(m);
      if (m) getMechanicReviews(m.id).then(setReviews);
    }).finally(() => setLoading(false));
  }, [id]);

  const requestForMechanic = () => {
    if (!currentUser) { 
      setShowLoginPrompt(true); 
      return; 
    }
    if (currentUser.role !== 'user') { 
      alert('برای ثبت درخواست با حساب کاربری وارد شوید'); 
      return; 
    }
    navigate(`/user/new-request?mechanic_id=${mechanic?.id}`);
  };

  // ─── آواتار مکانیک ──────────────────────────────────────────────────────────
const avatarUrl = 
  (mechanic as any)?.user?.avatar_url || 
  (mechanic as any)?.avatar_url
    ? `http://localhost:8000${(mechanic as any)?.user?.avatar_url || (mechanic as any)?.avatar_url}`
    : null;

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

  if (!mechanic) return (
    <div className="min-h-screen bg-[#0F172A]" dir="rtl"><PublicHeader onAuthNeeded={() => setShowLoginPrompt(true)} />
    <div className="mx-auto max-w-3xl px-8 py-24 text-center"><Wrench className="mx-auto mb-4 h-16 w-16 text-[#3B82F6]/30" /><h1 className="text-2xl font-black text-[#F8FAFC]">مکانیک پیدا نشد</h1>
    <Link to="/mechanics" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-6 py-3 text-sm font-bold text-white">بازگشت</Link></div></div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A]" dir="rtl">
      <PublicHeader onAuthNeeded={() => setShowLoginPrompt(true)} />
      <main>
        <section className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] py-14">
          <div className="mx-auto max-w-[1100px] px-8">
            <Link to="/mechanics" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#3B82F6] hover:text-[#06B6D4]"><ChevronLeft className="h-4 w-4 rotate-180" />بازگشت</Link>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* ─── ستون اول: اطلاعات اصلی با آواتار ─── */}
              <div className="rounded-3xl border border-[#1E293B] bg-[#1E293B] p-7 text-center">
                {/* ─── آواتار ─── */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={mechanic.full_name}
                    className="mx-auto h-28 w-28 rounded-3xl object-cover border-2 border-[#3B82F6]"
                  />
                ) : (
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-5xl font-black text-white">
                    {(mechanic.full_name || 'م').charAt(0)}
                  </div>
                )}
                <h1 className="mt-5 text-2xl font-black text-[#F8FAFC]">{mechanic.full_name}</h1>
                
                {/* ─── تخصص‌ها به صورت تگ ─── */}
                {mechanic.specializations && mechanic.specializations.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {mechanic.specializations.map((s) => (
                      <span key={s.id} className="rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs text-[#3B82F6]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {mechanic.average_rating > 0 && (
                  <div className="mt-4 flex justify-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(mechanic.average_rating) ? 'fill-current' : ''}`} />)}
                    <span className="mr-1 text-sm font-bold text-[#F8FAFC]">{mechanic.average_rating.toFixed(1)}</span>
                  </div>
                )}
                
                <button 
                  onClick={requestForMechanic} 
                  className="mt-7 w-full rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-6 py-3.5 text-sm font-black text-white shadow-lg hover:shadow-xl transition-all"
                >
                  ثبت درخواست
                </button>
              </div>

              {/* ─── ستون دوم: اطلاعات تکمیلی (Bio اینجاست) ─── */}
              <div className="rounded-3xl border border-[#1E293B] bg-[#1E293B] p-7 lg:col-span-2">
                <h2 className="text-xl font-black text-[#F8FAFC]">پروفایل عمومی</h2>
                
                {/* ─── Bio فقط اینجا ─── */}
                {mechanic.bio && (
                  <div className="mt-3 p-4 bg-[#0F172A] rounded-xl">
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{mechanic.bio}</p>
                  </div>
                )}
                
                {!mechanic.bio && (
                  <p className="mt-3 text-sm text-[#94A3B8]/60">توضیحی ثبت نشده است.</p>
                )}
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {mechanic.years_of_experience > 0 && (
                    <div className="rounded-xl bg-[#0F172A] p-3">
                      <p className="text-xs text-[#94A3B8]">تجربه</p>
                      <p className="text-sm font-bold text-white">{mechanic.years_of_experience} سال</p>
                    </div>
                  )}
                  {mechanic.city && (
                    <div className="rounded-xl bg-[#0F172A] p-3">
                      <p className="text-xs text-[#94A3B8]">شهر</p>
                      <p className="text-sm font-bold text-white">{mechanic.city}</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-[#0F172A] p-3">
                    <p className="text-xs text-[#94A3B8]">تعمیرات تکمیل شده</p>
                    <p className="text-sm font-bold text-white">{mechanic.total_completed || 0}</p>
                  </div>
                </div>
                
                {reviews && reviews.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-base font-bold text-white">نظرات کاربران</h3>
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map((r) => (
                        <div key={r.id} className="rounded-xl bg-[#0F172A] p-4">
                          <div className="flex items-center gap-1 text-amber-400 mb-1">
                            {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                          </div>
                          {r.comment && <p className="text-sm text-[#94A3B8]">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLoginPrompt(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#1E293B] bg-[#1E293B] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
                <Shield className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <button onClick={() => setShowLoginPrompt(false)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">ابتدا وارد حساب شوید</h3>
            <p className="mt-2 text-sm text-[#94A3B8]">برای ثبت درخواست برای این مکانیک، ابتدا وارد حساب کاربری خود شوید.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/login" className="flex-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-center text-sm font-bold text-white">ورود</Link>
              <button onClick={() => setShowLoginPrompt(false)} className="flex-1 rounded-xl border border-[#1E293B] bg-[#0F172A] py-3 text-sm font-bold text-[#94A3B8]">بستن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}