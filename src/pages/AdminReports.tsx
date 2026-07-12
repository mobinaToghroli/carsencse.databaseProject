import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { Users, Wrench, FileText, CheckCircle } from 'lucide-react';

export default function AdminReports() {
  const { getAdminStats, getAllReports } = useApp();  // ← اصلاح شد
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [statsData, reportsData] = await Promise.all([
        getAdminStats(),
        getAllReports()
      ]);
      setStats(statsData);
      setReports(reportsData);
      setLoading(false);
    };
    loadData();
  }, [getAdminStats, getAllReports]);

  // ─── فیلتر بر اساس بازه زمانی (mock) ─────────────────────────────────────
  const filterByDate = (reports: any[], range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return reports.filter(r => {
      const date = new Date(r.created_at);
      if (range === 'today') {
        return date >= today;
      } else if (range === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      } else { // month
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center text-[#94A3B8]">در حال بارگذاری...</div>
      </AdminLayout>
    );
  }

  const requestsInRange = filterByDate(reports, range);
  const completedInRange = requestsInRange.filter((r) => r.status === 'completed');
  const approvedInRange = requestsInRange.filter((r) => r.admin_status === 'approved');

  const rangeLabel = range === 'today' ? 'امروز' : range === 'week' ? 'این هفته' : 'این ماه';

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">گزارش‌ها و آمار</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">آمار عملکرد سیستم در {rangeLabel}</p>
        </div>

        {/* ─── دکمه‌های بازه زمانی ─── */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
            {[
              { value: 'today', label: 'امروز' },
              { value: 'week', label: 'این هفته' },
              { value: 'month', label: 'این ماه' }
            ].map((opt) => (
              <button 
                key={opt.value} 
                onClick={() => setRange(opt.value as any)} 
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  range === opt.value ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── کارت‌های آمار ─── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4">
            <p className="text-xs text-[#94A3B8]">کل درخواست‌ها ({rangeLabel})</p>
            <p className="mt-2 text-2xl font-black text-white">{requestsInRange.length}</p>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4">
            <p className="text-xs text-[#94A3B8]">تأیید شده</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{approvedInRange.length}</p>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4">
            <p className="text-xs text-[#94A3B8]">تکمیل شده</p>
            <p className="mt-2 text-2xl font-black text-[#06B6D4]">{completedInRange.length}</p>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4">
            <p className="text-xs text-[#94A3B8]">نرخ تکمیل</p>
            <p className="mt-2 text-2xl font-black text-amber-400">
              {requestsInRange.length > 0 ? Math.round((completedInRange.length / requestsInRange.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* ─── نمودار توزیع ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <h3 className="mb-4 text-base font-bold text-white">توزیع وضعیت درخواست‌ها</h3>
            <div className="space-y-4">
              {[
                { label: 'تکمیل شده', value: completedInRange.length, total: requestsInRange.length || 1, color: 'bg-emerald-400' },
                { label: 'تأیید شده', value: approvedInRange.length, total: requestsInRange.length || 1, color: 'bg-[#06B6D4]' },
                { label: 'در انتظار', value: requestsInRange.filter((r) => r.admin_status === 'pending').length, total: requestsInRange.length || 1, color: 'bg-amber-400' },
                { label: 'رد شده', value: requestsInRange.filter((r) => r.admin_status === 'rejected').length, total: requestsInRange.length || 1, color: 'bg-[#EF4444]' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#94A3B8]">{s.label}</span>
                    <span className="text-white">{s.value}</span>
                  </div>
                  <div className="h-2 bg-[#0F172A] rounded-full">
                    <div className={`h-2 ${s.color} rounded-full transition-all`} style={{ width: `${Math.round((s.value / s.total) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── آمار کلی ─── */}
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <h3 className="mb-4 text-base font-bold text-white">آمار کلی</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#3B82F6]" />
                  <span className="text-sm text-[#94A3B8]">کل کاربران</span>
                </div>
                <span className="text-lg font-bold text-white">{stats?.total_users || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-[#06B6D4]" />
                  <span className="text-sm text-[#94A3B8]">مکانیک‌های فعال</span>
                </div>
                <span className="text-lg font-bold text-white">{stats?.verified_mechanics || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-amber-400" />
                  <span className="text-sm text-[#94A3B8]">کل درخواست‌ها</span>
                </div>
                <span className="text-lg font-bold text-white">{stats?.total_reports || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-[#94A3B8]">کل تکمیل شده</span>
                </div>
                <span className="text-lg font-bold text-white">{stats?.completed_reports || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}