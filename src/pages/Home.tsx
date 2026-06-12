import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { PublicHeader } from '../components/PublicHeader';
import {
  Phone,
  Clock,
  Star,
  ChevronLeft,
  X,
  MapPin,
  Users,
  DollarSign,
  Shield,
  Mail,
} from 'lucide-react';

export default function Home() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleReportIssue = () => {
    if (currentUser) {
      navigate(currentUser.role === 'mechanic' ? '/mechanic/requests' : '/user/new-request');
    } else {
      setShowLoginPrompt(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]" dir="rtl">
      <PublicHeader onAuthNeeded={() => setShowLoginPrompt(true)} />

      {/* ========== HERO ========== */}
      <section className="relative bg-[#0F172A]">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            
            {/* RIGHT: Content */}
            <div className="flex flex-col justify-center px-8 py-14 lg:py-0 lg:pr-16 lg:pl-8 order-2 lg:order-1">
              <div className="max-w-lg">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#1E293B] px-5 py-2 text-xs font-medium text-[#3B82F6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
                  مرکز تخصصی عیب‌یابی و پشتیبانی فنی خودرو
                </span>

                <h2 className="text-4xl font-extrabold leading-tight text-[#F8FAFC] lg:text-[42px]">
                  تنها به اندازه یک کلیک,<br />
                  <span className="text-[#3B82F6]">با حرکت دوباره</span> فاصله دارید
                </h2>

                <p className="mt-5 text-base text-[#94A3B8] leading-relaxed">
                  دسترسی فوری به متخصصین عیب‌یابی؛ هوشمندانه، سریع و در تمام نقاط جاده.
                </p>

                <div className="mt-8">
                  <button
                    onClick={handleReportIssue}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-9 py-4 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#3B82F6]/40 hover:-translate-y-0.5 active:scale-95"
                  >
                    ثبت مشکل
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-sm text-[#94A3B8]">
                    ۴.۸/۵ — مورد اعتماد <span className="font-semibold text-[#F8FAFC]">۲۵,۰۰۰+</span> راننده
                  </div>
                </div>
              </div>
            </div>

            {/* LEFT: Image (full, not cut off) */}
            <div className="relative h-[400px] lg:h-[600px] order-1 lg:order-2 flex items-center justify-center">
              <img
                src="./images/hero-woman.jpg"
                alt="امداد خودرو"
                className="h-full w-full object-contain lg:object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES ========== */}
      <section className="bg-[#0F172A] py-20">
        <div className="mx-auto max-w-[1400px] px-8">
          <h3 className="mb-12 text-center text-3xl font-black text-[#F8FAFC]">خدمات ما</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#1E293B] p-8 transition-all hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/10 hover:-translate-y-1">
              <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full bg-[#3B82F6]/10 transition-transform group-hover:scale-110" />
              <div className="relative">
                <h4 className="mb-4 text-lg font-bold text-[#F8FAFC]">یدک‌کش ایمن و مطمئن</h4>
                <p className="mb-6 text-sm text-[#94A3B8] leading-relaxed">انتقال سریع و امن خودروی شما به نزدیک‌ترین تعمیرگاه معتبر.</p>
                <Link to="/mechanics" className="flex items-center text-sm font-semibold text-[#3B82F6] hover:text-[#06B6D4]">
                  درخواست یدک‌کش
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#1E293B] p-8 transition-all hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/10 hover:-translate-y-1">
              <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full bg-[#3B82F6]/10 transition-transform group-hover:scale-110" />
              <div className="relative">
                <h4 className="mb-4 text-lg font-bold text-[#F8FAFC]">تعمیرات تخصصی در محل</h4>
                <p className="mb-6 text-sm text-[#94A3B8] leading-relaxed">متخصصین ما برای رفع سریع مشکلات جزئی و راه‌اندازی خودرو کنار شما هستند.</p>
                <Link to="/mechanics" className="flex items-center text-sm font-semibold text-[#3B82F6] hover:text-[#06B6D4]">
                  مشاهده خدمات تعمیر
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#1E293B] p-8 transition-all hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/10 hover:-translate-y-1">
              <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full bg-[#3B82F6]/10 transition-transform group-hover:scale-110" />
              <div className="relative">
                <h4 className="mb-4 text-lg font-bold text-[#F8FAFC]">امداد فوری ۲۴/۷</h4>
                <p className="mb-6 text-sm text-[#94A3B8] leading-relaxed">پشتیبانی لحظه‌ای برای هرگونه مشکل در جاده و خیابان، در هر ساعت از شبانه‌روز.</p>
                <button onClick={handleReportIssue} className="flex items-center text-sm font-semibold text-[#3B82F6] hover:text-[#06B6D4]">
                  دریافت کمک فوری
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="bg-[#1E293B]/50 py-12">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4 gap-y-8 px-8">
          {[
            { icon: <Clock />, title: 'در دسترس بودن ۲۴/۷', desc: 'ما همیشه در کنار شما هستیم' },
            { icon: <MapPin />, title: 'پوشش سراسری کشور', desc: 'پوشش کامل در شهرها و بزرگراه‌ها' },
            { icon: <Users />, title: 'متخصصان مورد اعتماد', desc: 'نیروهای ماهر و تأیید صلاحیت شده' },
            { icon: <DollarSign />, title: 'قیمت‌گذاری شفاف', desc: 'بدون هزینه‌های پنهان و غیرمنتظره' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
                {f.icon}
              </div>
              <h5 className="text-sm font-bold text-[#F8FAFC]">{f.title}</h5>
              <p className="text-xs text-[#94A3B8] mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-[#1E293B] bg-[#0F172A] pt-16 pb-8">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h4 className="text-xl font-black text-[#F8FAFC]">کار سنس</h4>
              <p className="mt-3 text-sm text-[#94A3B8]">امداد سریع و سراسری، ۲۴ ساعته در کنار شما.</p>
            </div>
            <div>
              <h5 className="mb-3 text-sm font-bold text-[#F8FAFC]">دسترسی سریع</h5>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li><Link to="/" className="hover:text-[#3B82F6]">صفحه اصلی</Link></li>
                <li><button onClick={handleReportIssue} className="hover:text-[#3B82F6]">ثبت مشکل</button></li>
                <li><Link to="/mechanics" className="hover:text-[#3B82F6]">مکانیک‌ها</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-3 text-sm font-bold text-[#F8FAFC]">خدمات ما</h5>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li>یدک‌کش</li>
                <li>تعمیر در محل</li>
                <li>سوخت‌رسانی سیار</li>
              </ul>
            </div>
            <div>
              <h5 className="mb-3 text-sm font-bold text-[#F8FAFC]">ارتباط با ما</h5>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#3B82F6]" /> 021-12345678</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#3B82F6]" /> CarSense@gmail.com</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#3B82F6]" /> کرمان</li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-6 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
            © {new Date().getFullYear()} CarSense — تمامی حقوق محفوظ است
          </div>
        </div>
      </footer>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLoginPrompt(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#1E293B] bg-[#1E293B] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
                <Shield className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <button onClick={() => setShowLoginPrompt(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">ابتدا وارد حساب خود شوید</h3>
            <p className="mt-2 text-sm text-[#94A3B8]">برای ثبت مشکل خودرو، ابتدا باید وارد شوید یا حساب کاربری بسازید.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/login" className="flex-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-center text-sm font-bold text-white">ورود</Link>
              <Link to="/login" className="flex-1 rounded-xl border border-[#1E293B] bg-[#0F172A] py-3 text-center text-sm font-bold text-[#3B82F6]">ثبت‌نام</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
