import { useState, useEffect } from 'react';
import { useApp, BackendReport } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Search, UserCheck, Inbox, X, Send, DollarSign } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار', assigned: 'قبول شده', diagnosing: 'تشخیص',
  waiting_for_visit: 'منتظر مراجعه', completed: 'تکمیل', cancelled: 'لغو',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  assigned: 'bg-blue-500/10 text-blue-400',
  diagnosing: 'bg-cyan-500/10 text-cyan-400',
  waiting_for_visit: 'bg-purple-500/10 text-purple-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
};
const PRIORITY_LABEL: Record<string, string> = { normal: 'عادی', urgent: 'فوری', emergency: 'اضطراری' };
const PRIORITY_COLOR: Record<string, string> = {
  normal: 'bg-slate-500/10 text-slate-400',
  urgent: 'bg-amber-500/10 text-amber-400',
  emergency: 'bg-red-500/10 text-red-400',
};
const NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  assigned: [{ value: 'diagnosing', label: 'شروع تشخیص' }, { value: 'cancelled', label: 'لغو' }],
  diagnosing: [{ value: 'waiting_for_visit', label: 'تعیین تاریخ مراجعه' }, { value: 'cancelled', label: 'لغو' }],
  waiting_for_visit: [{ value: 'completed', label: 'تکمیل تعمیر' }],
};

export default function MechanicRequests() {
  const { getAvailableReports, getMyAssignedReports, acceptReport, updateReportStatus, getResponses, sendResponse } = useApp();

  const [viewMode, setViewMode] = useState<'mine' | 'available'>('mine');
  const [assigned, setAssigned] = useState<BackendReport[]>([]);
  const [available, setAvailable] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // modal مدیریت درخواست
  const [selectedReport, setSelectedReport] = useState<BackendReport | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [cost, setCost] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const [a, av] = await Promise.all([getMyAssignedReports(), getAvailableReports()]);
    setAssigned(a);
    setAvailable(av);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openReport = async (r: BackendReport) => {
    setSelectedReport(r);
    const res = await getResponses(r.id);
    setResponses(res);
  };

  const handleAccept = async (id: number) => {
    const ok = await acceptReport(id);
    if (ok) { await load(); setViewMode('mine'); }
    else alert('این درخواست قبلاً توسط مکانیک دیگری پذیرفته شده است');
  };

  const handleStatusChange = async (report: BackendReport, status: string) => {
    const ok = await updateReportStatus(report.id, status);
    if (ok) { await load(); setSelectedReport(null); }
  };

  const handleSendResponse = async () => {
    if (!selectedReport || !newMessage.trim()) return;
    setSending(true);
    await sendResponse(selectedReport.id, {
      message: newMessage.trim(),
      estimated_cost: cost ? parseFloat(cost) : undefined,
      visit_date: visitDate || undefined,
    });
    const res = await getResponses(selectedReport.id);
    setResponses(res);
    setNewMessage(''); setCost(''); setVisitDate('');
    setSending(false);
    // اگر تاریخ مراجعه داد، وضعیت رو هم عوض کن
    if (visitDate && selectedReport.status === 'diagnosing') {
      await load();
    }
  };

  const list = viewMode === 'mine' ? assigned : available;
  const filtered = list.filter((r) => {
    const matchSearch =
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">مدیریت درخواست‌ها</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {available.length} درخواست آزاد · {assigned.length} درخواست من
          </p>
        </div>

        {/* ─── فیلترها ─── */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
              <button onClick={() => setViewMode('mine')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${viewMode === 'mine' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>
                <UserCheck className="h-3.5 w-3.5" />درخواست‌های من ({assigned.length})
              </button>
              <button onClick={() => setViewMode('available')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${viewMode === 'available' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>
                <Inbox className="h-3.5 w-3.5" />آزاد ({available.length})
              </button>
            </div>
            {viewMode === 'mine' && (
              <div className="flex items-center gap-1 rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
                {[{ v: 'all', l: 'همه' }, { v: 'assigned', l: 'قبول شده' }, { v: 'diagnosing', l: 'تشخیص' }, { v: 'completed', l: 'تکمیل' }].map((o) => (
                  <button key={o.v} onClick={() => setStatusFilter(o.v)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === o.v ? 'bg-[#06B6D4] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B] pr-10 pl-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none lg:w-72" />
          </div>
        </div>

        {/* ─── جدول ─── */}
        <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#1E293B] shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="mb-3 text-5xl">{viewMode === 'mine' ? '🔧' : '📋'}</span>
              <p className="font-medium text-[#94A3B8]">
                {viewMode === 'mine' ? 'هنوز درخواستی نپذیرفته‌اید' : 'درخواست آزادی وجود ندارد'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#0F172A]">
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">#</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">دسته‌بندی</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">شرح مشکل</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">اولویت</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">وضعیت</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">تاریخ</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-[#94A3B8]">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F172A]">
                  {filtered.map((req) => (
                    <tr key={req.id} className="transition-colors hover:bg-[#0F172A]">
                      <td className="px-5 py-4 font-mono text-sm font-bold text-[#3B82F6]">#{req.id}</td>
                      <td className="px-5 py-4 text-sm text-white">{req.category}</td>
                      <td className="px-5 py-4">
                        <p className="max-w-[180px] text-sm text-[#94A3B8] line-clamp-2">{req.description}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[req.priority] || ''}`}>
                          {PRIORITY_LABEL[req.priority] || req.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[req.status] || ''}`}>
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#94A3B8]">
                        {new Date(req.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {viewMode === 'mine' ? (
                            <button onClick={() => openReport(req)}
                              className="flex items-center gap-1 rounded-lg bg-[#3B82F6]/10 px-3.5 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/20">
                              🔧 مدیریت
                            </button>
                          ) : (
                            <button onClick={() => handleAccept(req.id)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20">
                              ✅ پذیرش
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal مدیریت درخواست ─── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#1E293B] bg-[#1E293B] shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-[#0F172A] bg-[#1E293B] p-5">
              <h3 className="text-base font-bold text-white">درخواست #{selectedReport.id}</h3>
              <button onClick={() => setSelectedReport(null)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* اطلاعات درخواست */}
              <div className="rounded-xl bg-[#0F172A] p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">دسته‌بندی</span>
                  <span className="text-white font-medium">{selectedReport.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">اولویت</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[selectedReport.priority]}`}>
                    {PRIORITY_LABEL[selectedReport.priority]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">وضعیت</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[selectedReport.status]}`}>
                    {STATUS_LABELS[selectedReport.status]}
                  </span>
                </div>
                <div className="mt-2 border-t border-[#1E293B] pt-2">
                  <p className="text-[#94A3B8] mb-1">شرح مشکل</p>
                  <p className="text-white leading-relaxed">{selectedReport.description}</p>
                </div>
              </div>

              {/* تغییر وضعیت */}
              {NEXT_STATUS[selectedReport.status] && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#94A3B8]">تغییر وضعیت:</p>
                  <div className="flex flex-wrap gap-2">
                    {NEXT_STATUS[selectedReport.status].map((ns) => (
                      <button key={ns.value} onClick={() => handleStatusChange(selectedReport, ns.value)}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${ns.value === 'cancelled' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                        {ns.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* گفتگو */}
              <div>
                <h4 className="mb-3 text-sm font-bold text-white">گفتگو با کاربر</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                  {responses.length === 0 ? (
                    <p className="text-center text-xs text-[#94A3B8] py-4">هنوز پیامی ارسال نشده</p>
                  ) : (
                    responses.map((r) => (
                      <div key={r.id} className="rounded-lg bg-[#0F172A] p-3 text-sm">
                        <p className="text-white">{r.message}</p>
                        {r.estimated_cost && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-[#3B82F6]">
                            <DollarSign className="h-3 w-3" />{r.estimated_cost.toLocaleString('fa-IR')} تومان
                          </p>
                        )}
                        {r.visit_date && (
                          <p className="mt-1 text-xs text-purple-400">📅 تاریخ مراجعه: {r.visit_date}</p>
                        )}
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {new Date(r.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* فرم ارسال پاسخ */}
                <div className="space-y-2">
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..." rows={2}
                    className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none resize-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={cost} onChange={(e) => setCost(e.target.value)}
                      placeholder="تخمین هزینه (تومان) — اختیاری"
                      className="rounded-lg border border-[#0F172A] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" />
                    <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
                      placeholder="تاریخ مراجعه — اختیاری"
                      className="rounded-lg border border-[#0F172A] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-[#3B82F6] focus:outline-none" />
                  </div>
                  <button onClick={handleSendResponse} disabled={!newMessage.trim() || sending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50">
                    <Send className="h-4 w-4" />{sending ? 'در حال ارسال...' : 'ارسال پاسخ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
