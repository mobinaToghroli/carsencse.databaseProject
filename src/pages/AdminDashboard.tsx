import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { Users, Wrench, FileText, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react';

export default function AdminDashboard() {
  const { getStats } = useApp();
  const stats = getStats();

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8"><h1 className="text-2xl font-black text-white">داشبورد</h1><p className="mt-1 text-sm text-[#94A3B8]">نمای کلی از وضعیت سیستم</p></div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="کاربران" value={stats.totalUsers} color="blue" />
          <StatCard icon={<Wrench className="h-5 w-5" />} label="مکانیک‌ها" value={`${stats.totalMechanicsApproved} / ${stats.totalMechanics}`} color="cyan" />
          <StatCard icon={<FileText className="h-5 w-5" />} label="درخواست‌ها" value={stats.totalRequests} color="amber" />
          <StatCard icon={<CheckCircle className="h-5 w-5" />} label="تکمیل شده" value={stats.totalCompleted} color="emerald" />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Clock className="h-5 w-5" />} label="در انتظار تأیید" value={stats.pendingRequests} color="amber" />
          <StatCard icon={<Wrench className="h-5 w-5" />} label="مکانیک در انتظار" value={stats.pendingMechanics} color="rose" />
          <StatCard icon={<Star className="h-5 w-5" />} label="کل امتیازات" value={stats.totalRatings} color="amber" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="نرخ تکمیل" value={stats.totalRequests > 0 ? Math.round((stats.totalCompleted / stats.totalRequests) * 100) + '%' : '۰%'} color="indigo" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <h3 className="mb-4 text-base font-bold text-white">آخرین فعالیت‌ها</h3>
            <div className="space-y-3">
              {stats.pendingRequests > 0 && <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><Clock className="h-4 w-4 text-amber-400" /><span className="text-sm text-[#94A3B8]">{stats.pendingRequests} درخواست در انتظار تأیید</span></div>}
              {stats.pendingMechanics > 0 && <div className="flex items-center gap-3 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-3"><Wrench className="h-4 w-4 text-[#3B82F6]" /><span className="text-sm text-[#94A3B8]">{stats.pendingMechanics} مکانیک در انتظار تأیید</span></div>}
              {stats.totalRatings > 0 && <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><Star className="h-4 w-4 text-amber-400" /><span className="text-sm text-[#94A3B8]">{stats.totalRatings} امتیاز ثبت شده</span></div>}
              {(stats.pendingRequests === 0 && stats.pendingMechanics === 0 && stats.totalRatings === 0) && <p className="text-sm text-[#94A3B8] text-center py-8">هنوز فعالیتی ثبت نشده</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <h3 className="mb-4 text-base font-bold text-white">خلاصه عملکرد</h3>
            <div className="space-y-4">
              <div><div className="flex justify-between text-sm mb-1"><span className="text-[#94A3B8]">درخواست‌های تأیید شده</span><span className="text-white">{stats.totalApproved}</span></div><div className="h-2 bg-[#0F172A] rounded-full"><div className="h-2 bg-[#3B82F6] rounded-full transition-all" style={{ width: stats.totalRequests > 0 ? `${(stats.totalApproved / stats.totalRequests) * 100}%` : '0%' }}></div></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span className="text-[#94A3B8]">درخواست‌های تکمیل شده</span><span className="text-white">{stats.totalCompleted}</span></div><div className="h-2 bg-[#0F172A] rounded-full"><div className="h-2 bg-emerald-400 rounded-full transition-all" style={{ width: stats.totalRequests > 0 ? `${(stats.totalCompleted / stats.totalRequests) * 100}%` : '0%' }}></div></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span className="text-[#94A3B8]">مکانیک‌های تأیید شده</span><span className="text-white">{stats.totalMechanicsApproved}</span></div><div className="h-2 bg-[#0F172A] rounded-full"><div className="h-2 bg-[#06B6D4] rounded-full transition-all" style={{ width: stats.totalMechanics > 0 ? `${(stats.totalMechanicsApproved / stats.totalMechanics) * 100}%` : '0%' }}></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: _icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const cls: Record<string, string> = { blue: 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]', cyan: 'bg-[#06B6D4]/10 border-[#06B6D4]/20 text-[#06B6D4]', amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400', emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', rose: 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]', indigo: 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]' };
  return (<div className={`rounded-xl border p-4 ${cls[color] || cls.blue}`}><p className="text-xs font-medium">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>);
}
