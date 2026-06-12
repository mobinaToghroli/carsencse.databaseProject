import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { CheckCircle } from 'lucide-react';

export default function AdminReports() {
  const { getStats, getRequestsByDate } = useApp();
  const [range, setRange] = useState<'today' | 'week' | 'month'>('week');
  const stats = getStats();
  const requestsInRange = getRequestsByDate(range);
  const completedInRange = requestsInRange.filter((r) => r.status === 'completed');
  const approvedInRange = requestsInRange.filter((r) => r.adminStatus === 'approved');

  const rangeLabel = range === 'today' ? 'امروز' : range === 'week' ? 'این هفته' : 'این ماه';

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6"><h1 className="text-2xl font-black text-white">گزارش‌ها و آمار</h1><p className="mt-1 text-sm text-[#94A3B8]">آمار عملکرد سیستم در {rangeLabel}</p></div>

        <div className="mb-6 flex flex-wrap gap-2">
          <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
            {[{ value: 'today', label: 'امروز' }, { value: 'week', label: 'این هفته' }, { value: 'month', label: 'این ماه' }].map((opt) => (
              <button key={opt.value} onClick={() => setRange(opt.value as any)} className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${range === opt.value ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">کل درخواست‌ها ({rangeLabel})</p><p className="mt-2 text-2xl font-black text-white">{requestsInRange.length}</p></div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">تأیید شده</p><p className="mt-2 text-2xl font-black text-emerald-400">{approvedInRange.length}</p></div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">تکمیل شده</p><p className="mt-2 text-2xl font-black text-[#06B6D4]">{completedInRange.length}</p></div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">نرخ تکمیل</p><p className="mt-2 text-2xl font-black text-amber-400">{requestsInRange.length > 0 ? Math.round((completedInRange.length / requestsInRange.length) * 100) : 0}%</p></div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <h3 className="mb-4 text-base font-bold text-white">توزیع وضعیت درخواست‌ها</h3>
            <div className="space-y-4">
              {[
                { label: 'تکمیل شده', value: completedInRange.length, total: requestsInRange.length || 1, color: 'bg-emerald-400' },
                { label: 'تأیید شده', value: approvedInRange.length, total: requestsInRange.length || 1, color: 'bg-[#06B6D4]' },
                { label: 'در انتظار', value: requestsInRange.filter((r) => r.adminStatus === 'pending').length, total: requestsInRange.length || 1, color: 'bg-amber-400' },
                { label: 'رد شده', value: requestsInRange.filter((r) => r.adminStatus === 'rejected').length, total: requestsInRange.length || 1, color: 'bg-[#EF4444]' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-[#94A3B8]">{s.label}</span><span className="text-white">{s.value}</span></div>
                  <div className="h-2 bg-[#0F172A] rounded-full"><div className={`h-2 ${s.color} rounded-full transition-all`} style={{ width: `${Math.round((s.value / s.total) * 100)}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <h3 className="mb-4 text-base font-bold text-white">آمار کلی</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-[#3B82F6]" /><span className="text-sm text-[#94A3B8]">کل کاربران</span></div><span className="text-lg font-bold text-white">{stats.totalUsers}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]"><div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-[#06B6D4]" /><span className="text-sm text-[#94A3B8]">مکانیک‌های فعال</span></div><span className="text-lg font-bold text-white">{stats.totalMechanicsApproved}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-amber-400" /><span className="text-sm text-[#94A3B8]">کل درخواست‌ها</span></div><span className="text-lg font-bold text-white">{stats.totalRequests}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]"><div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="text-sm text-[#94A3B8]">کل تکمیل شده</span></div><span className="text-lg font-bold text-white">{stats.totalCompleted}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 lg:col-span-2">
            <h3 className="mb-4 text-base font-bold text-white">آخرین درخواست‌ها ({rangeLabel})</h3>
            {requestsInRange.length === 0 ? (
              <p className="text-center py-8 text-sm text-[#94A3B8]">درخواستی در این بازه زمانی ثبت نشده</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-[#0F172A]">
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8]">کد</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8]">مشتری</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8]">خودرو</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8]">تاریخ</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8]">وضعیت</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[#0F172A]">
                    {requestsInRange.slice(0, 10).map((r) => (
                      <tr key={r.id} className="text-sm">
                        <td className="px-4 py-3 font-mono text-[#3B82F6]">{r.trackingCode}</td>
                        <td className="px-4 py-3 text-white">{r.clientName}</td>
                        <td className="px-4 py-3 text-[#94A3B8]">{r.vehicleModel}</td>
                        <td className="px-4 py-3 text-[#94A3B8]">{r.createdAt}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.adminStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : r.adminStatus === 'rejected' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-amber-500/10 text-amber-400'}`}>{r.adminStatus === 'pending' ? 'در انتظار' : r.adminStatus === 'approved' ? 'تأیید' : 'رد'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { Users, Wrench, FileText } from 'lucide-react';
