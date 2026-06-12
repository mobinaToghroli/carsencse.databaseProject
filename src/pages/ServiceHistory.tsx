import { useState, useEffect } from 'react';
import { useApp, BackendReport } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Wrench } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', assigned: 'قبول شده', diagnosing: 'تشخیص', waiting_for_visit: 'منتظر مراجعه', completed: 'تکمیل', cancelled: 'لغو' };
const STATUS_COLOR: Record<string, string> = { completed: 'bg-emerald-500/10 text-emerald-400', cancelled: 'bg-red-500/10 text-red-400', pending: 'bg-amber-500/10 text-amber-400' };

export default function ServiceHistory() {
  const { currentUser, getMyAssignedReports, getMyReports } = useApp();
  const isMechanic = currentUser?.role === 'mechanic';
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = isMechanic ? getMyAssignedReports : getMyReports;
    load().then(setReports).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);
  const completed = reports.filter((r) => r.status === 'completed').length;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6"><h1 className="text-2xl font-black text-white">تاریخچه خدمات</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">{isMechanic ? 'خدماتی که انجام داده‌اید' : 'خدماتی که دریافت کرده‌اید'}</p></div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">کل درخواست‌ها</p><p className="mt-2 text-xl font-bold text-white">{reports.length}</p></div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">تکمیل شده</p><p className="mt-2 text-xl font-bold text-emerald-400">{completed}</p></div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B] p-4"><p className="text-xs text-[#94A3B8]">نرخ تکمیل</p><p className="mt-2 text-xl font-bold text-[#3B82F6]">{reports.length > 0 ? Math.round((completed / reports.length) * 100) : 0}%</p></div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-[#1E293B] bg-[#1E293B] p-1.5 w-fit">
          {[{ v: 'all', l: 'همه' }, { v: 'completed', l: 'تکمیل شده' }, { v: 'cancelled', l: 'لغو شده' }].map((o) => (
            <button key={o.v} onClick={() => setFilter(o.v)} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${filter === o.v ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>{o.l}</button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-16"><svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
        : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 rounded-2xl border-2 border-dashed border-[#1E293B] bg-[#1E293B]/50">
            <Wrench className="mb-3 h-12 w-12 text-[#3B82F6]/20" />
            <p className="font-medium text-[#94A3B8]">نتیجه‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div key={req.id} className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-5">
                <div className="flex items-start justify-between">
                  <div><span className="font-mono text-sm font-bold text-[#3B82F6]">#{req.id}</span>
                  <p className="mt-1 text-sm font-medium text-white">{req.title}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{req.category} · {new Date(req.created_at).toLocaleDateString('fa-IR')}</p></div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[req.status] || 'bg-slate-500/10 text-slate-400'}`}>{STATUS_LABELS[req.status] || req.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
