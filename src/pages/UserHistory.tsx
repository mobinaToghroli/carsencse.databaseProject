import { useState, useEffect } from 'react';
import { useApp, BackendReport } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Eye, Search, Star, X } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  assigned: 'قبول شده',
  diagnosing: 'در حال تشخیص',
  waiting_for_visit: 'منتظر مراجعه',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  assigned: 'bg-blue-500/10 text-blue-400',
  diagnosing: 'bg-cyan-500/10 text-cyan-400',
  waiting_for_visit: 'bg-purple-500/10 text-purple-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  engine: 'موتور', gearbox: 'گیربکس', electrical: 'برق',
  brakes: 'ترمز', cooling: 'خنک‌کننده', steering: 'فرمان',
  body: 'بدنه', suspension: 'تعلیق', exhaust: 'اگزوز', other: 'سایر',
};

export default function UserHistory() {
  // ✅ getMyReports، cancelReport، submitReview از بکند می‌آیند
  const { getMyReports, cancelReport, submitReview } = useApp();

  const [reports, setReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // modal جزئیات
  const [selectedReport, setSelectedReport] = useState<BackendReport | null>(null);

  // modal امتیاز
  const [rateReport, setRateReport] = useState<BackendReport | null>(null);
  const [rating, setRating] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [rateSubmitting, setRateSubmitting] = useState(false);

  // ─── بارگذاری درخواست‌ها از بکند ──────────────────────────────────────────
  const loadReports = () => {
    setLoading(true);
    getMyReports()
      .then(setReports)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, []);

  // ─── لغو درخواست ──────────────────────────────────────────────────────────
  const handleCancel = async (id: number) => {
    if (!confirm('آیا از لغو این درخواست مطمئن هستید؟')) return;
    // ✅ cancelReport به بکند می‌رود
    const ok = await cancelReport(id);
    if (ok) loadReports();
  };

  // ─── ثبت امتیاز ───────────────────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!rateReport || rating === 0) return;
    setRateSubmitting(true);
    // ✅ submitReview به بکند می‌رود
    const ok = await submitReview(rateReport.id, rating, rateComment || undefined);
    setRateSubmitting(false);
    if (ok) {
      setRateReport(null);
      setRating(0);
      setRateComment('');
      loadReports();
    }
  };

  // ─── فیلتر ────────────────────────────────────────────────────────────────
  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).includes(searchTerm);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ✅ فقط درخواست‌های completed که مکانیک داشتند قابل امتیاز دادن هستند
  const canRate = (r: BackendReport) =>
    r.status === 'completed' && r.assigned_mechanic_id !== null;

  // ✅ فقط pending یا assigned قابل لغو هستند
  const canCancel = (r: BackendReport) =>
    r.status === 'pending' || r.status === 'assigned';

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">تاریخچه درخواست‌ها</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">شما {reports.length} درخواست ثبت کرده‌اید</p>
        </div>

        {/* ─── فیلترها ─── */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-[#1E293B] bg-[#1E293B] p-1 shadow-sm">
            {[
              { value: 'all', label: 'همه' },
              { value: 'pending', label: 'در انتظار' },
              { value: 'assigned', label: 'قبول شده' },
              { value: 'completed', label: 'تکمیل شده' },
              { value: 'cancelled', label: 'لغو شده' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === opt.value ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="جستجو..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B] pr-10 pl-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none md:w-64" />
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-3 text-5xl">📋</span>
              <p className="font-medium text-[#94A3B8]">
                {reports.length === 0 ? 'هنوز درخواستی ثبت نکرده‌اید' : 'درخواستی یافت نشد'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#0F172A]">
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8]">#</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8]">تاریخ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8]">مشکل</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8]">دسته‌بندی</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8]">وضعیت</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-[#94A3B8]">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F172A]">
                  {filtered.map((req) => (
                    <tr key={req.id}
                      className="cursor-pointer transition-colors hover:bg-[#0F172A]"
                      onClick={() => setSelectedReport(req)}>
                      {/* ✅ شماره درخواست از بکند */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-[#3B82F6]">#{req.id}</span>
                      </td>
                      {/* ✅ created_at به جای createdAt */}
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {new Date(req.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="line-clamp-1 text-sm font-medium text-white">{req.title}</p>
                        <p className="line-clamp-1 text-xs text-[#94A3B8]">{req.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {CATEGORY_LABELS[req.category] || req.category}
                      </td>
                      <td className="px-6 py-4">
                        {/* ✅ وضعیت‌های بکند به فارسی */}
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[req.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelectedReport(req)}
                            className="flex items-center gap-1 rounded-lg bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#3B82F6] hover:bg-[#3B82F6]/20">
                            <Eye className="h-3 w-3" />مشاهده
                          </button>
                          {/* ✅ امتیاز — فقط وقتی completed باشد */}
                          {canRate(req) && (
                            <button onClick={() => { setRateReport(req); setRating(0); setRateComment(''); }}
                              className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30">
                              <Star className="h-3 w-3" />امتیاز
                            </button>
                          )}
                          {/* ✅ لغو — فقط وقتی pending یا assigned باشد */}
                          {canCancel(req) && (
                            <button onClick={() => handleCancel(req.id)}
                              className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20">
                              لغو
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

      {/* ─── Modal جزئیات درخواست ─── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">جزئیات درخواست #{selectedReport.id}</h3>
              <button onClick={() => setSelectedReport(null)} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#0F172A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">عنوان</span>
                <span className="font-medium text-white">{selectedReport.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">دسته‌بندی</span>
                <span className="text-white">{CATEGORY_LABELS[selectedReport.category] || selectedReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">اولویت</span>
                <span className="text-white">
                  {selectedReport.priority === 'emergency' ? '🆘 اضطراری' : selectedReport.priority === 'urgent' ? '🔴 فوری' : '🟡 عادی'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">وضعیت</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[selectedReport.status] || ''}`}>
                  {STATUS_LABELS[selectedReport.status] || selectedReport.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">تاریخ ثبت</span>
                <span className="text-white">{new Date(selectedReport.created_at).toLocaleDateString('fa-IR')}</span>
              </div>
              <div className="mt-2 rounded-lg bg-[#0F172A] p-3">
                <p className="mb-1 text-xs text-[#94A3B8]">شرح مشکل</p>
                <p className="leading-relaxed text-white">{selectedReport.description}</p>
              </div>
            </div>
            {canCancel(selectedReport) && (
              <button onClick={() => { handleCancel(selectedReport.id); setSelectedReport(null); }}
                className="mt-4 w-full rounded-lg bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20">
                لغو درخواست
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Modal امتیازدهی ─── */}
      {rateReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setRateReport(null)}>
          <div className="w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">امتیاز به مکانیک</h3>
              <button onClick={() => setRateReport(null)} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#0F172A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* ستاره‌ها */}
            <div className="mb-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <Star className={`h-8 w-8 transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-[#94A3B8]'}`} />
                </button>
              ))}
            </div>
            <textarea value={rateComment} onChange={(e) => setRateComment(e.target.value)}
              placeholder="نظر شما (اختیاری)" rows={3}
              className="w-full resize-none rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" />
            <button onClick={handleSubmitReview} disabled={rating === 0 || rateSubmitting}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {rateSubmitting ? 'در حال ثبت...' : 'ثبت امتیاز'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
