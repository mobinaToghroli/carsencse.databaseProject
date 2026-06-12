import { useEffect, useState } from 'react';
import { useApp, BackendReport } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Wrench, Clock, CheckCircle, Inbox, ArrowLeft } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', assigned: 'قبول شده', diagnosing: 'تشخیص', waiting_for_visit: 'منتظر مراجعه', completed: 'تکمیل', cancelled: 'لغو' };
const STATUS_COLOR: Record<string, string> = { pending: 'bg-amber-500/10 text-amber-400', assigned: 'bg-blue-500/10 text-blue-400', diagnosing: 'bg-cyan-500/10 text-cyan-400', waiting_for_visit: 'bg-purple-500/10 text-purple-400', completed: 'bg-emerald-500/10 text-emerald-400', cancelled: 'bg-red-500/10 text-red-400' };

export default function MechanicDashboard() {
  const { currentUser, getMyAssignedReports, getAvailableReports, getMyMechanicProfile } = useApp();
  const [assigned, setAssigned] = useState<BackendReport[]>([]);
  const [available, setAvailable] = useState<BackendReport[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAssignedReports(), getAvailableReports(), getMyMechanicProfile()])
      .then(([a, av, p]) => { setAssigned(a); setAvailable(av); setProfile(p); })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    available: available.length,
    myTotal: assigned.length,
    myInProgress: assigned.filter((r) => ['assigned', 'diagnosing', 'waiting_for_visit'].includes(r.status)).length,
    myCompleted: assigned.filter((r) => r.status === 'completed').length,
    avgRating: profile?.average_rating || 0,
  };
  const recentAssigned = [...assigned].sort((a, b) => b.updated_at > a.updated_at ? 1 : -1).slice(0, 5);
  const recentAvailable = available.slice(0, 3);

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div></Layout>;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white lg:text-3xl">خوش آمدید، {currentUser?.full_name}</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">داشبورد مکانیک</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {[
            { label: 'درخواست آزاد', value: stats.available, color: 'amber' },
            { label: 'کل درخواست‌های من', value: stats.myTotal, color: 'slate' },
            { label: 'در جریان', value: stats.myInProgress, color: 'cyan' },
            { label: 'تکمیل شده', value: stats.myCompleted, color: 'emerald' },
            { label: 'امتیاز میانگین', value: stats.avgRating.toFixed(1), color: 'amber' },
          ].map((s) => {
            const cls: Record<string, string> = { slate: 'bg-[#1E293B] border-[#1E293B] text-[#94A3B8]', amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400', cyan: 'bg-[#06B6D4]/10 border-[#06B6D4]/20 text-[#06B6D4]', emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
            return (<div key={s.label} className={`rounded-xl border p-4 ${cls[s.color] || cls.slate}`}><p className="text-xs font-medium">{s.label}</p><p className="mt-2 text-2xl font-black">{s.value}</p></div>);
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">درخواست‌های من</h3>
              <Link to="/mechanic/requests" className="flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#06B6D4]">همه <ArrowLeft className="h-3 w-3" /></Link>
            </div>
            {recentAssigned.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center"><Wrench className="mb-3 h-10 w-10 text-[#94A3B8]/30" /><p className="text-sm text-[#94A3B8]">هنوز درخواستی نپذیرفته‌اید</p></div>
            ) : (
              <div className="space-y-3">
                {recentAssigned.map((req) => (
                  <div key={req.id} className="rounded-xl border border-[#1E293B]/50 bg-[#0F172A]/50 p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-semibold text-white">درخواست #{req.id}</p><p className="text-xs text-[#94A3B8]">{req.category} · {new Date(req.created_at).toLocaleDateString('fa-IR')}</p></div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[req.status] || ''}`}>{STATUS_LABELS[req.status] || req.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#94A3B8] line-clamp-1">{req.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">درخواست‌های آزاد {available.length > 0 && <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">{available.length}</span>}</h3>
              <Link to="/mechanic/requests" className="flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#06B6D4]">همه <ArrowLeft className="h-3 w-3" /></Link>
            </div>
            {recentAvailable.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center"><Inbox className="mb-3 h-10 w-10 text-[#94A3B8]/30" /><p className="text-sm text-[#94A3B8]">درخواست آزادی وجود ندارد</p></div>
            ) : (
              <div className="space-y-3">
                {recentAvailable.map((req) => (
                  <div key={req.id} className="rounded-xl border border-[#3B82F6]/10 bg-[#3B82F6]/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1"><p className="text-sm font-semibold text-white">درخواست #{req.id}</p><p className="text-xs text-[#94A3B8]">{req.description.slice(0, 50)}...</p></div>
                      <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium ${req.priority === 'emergency' ? 'bg-red-500/10 text-red-400' : req.priority === 'urgent' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                        {req.priority === 'emergency' ? 'اضطراری' : req.priority === 'urgent' ? 'فوری' : 'عادی'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
