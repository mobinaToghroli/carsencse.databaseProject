import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { StatusBadge } from '../components/StatusBadge';
import { MediaViewer } from '../components/MediaViewer';
import { Search, CheckCircle, XCircle, Eye, Camera, Mic } from 'lucide-react';

export default function AdminRequests() {
  const { getAllReports } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // ─── تابع برای ساخت URL کامل ──────────────────────────────────────────────
  const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('uploads/')) {
      return `http://localhost:8000/${filePath}`;
    }
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `http://localhost:8000/uploads/${filePath}`;
  };

  // ─── بارگذاری درخواست‌ها از بک‌اند ──────────────────────────────────────
  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      const data = await getAllReports();
      console.log('📦 Raw data from API:', data);
      
      // تبدیل داده‌های بک‌اند به فرمت فرانت
      const formatted = (data || []).map((r: any) => ({
        id: r.id,
        trackingCode: r.tracking_code || `REQ-${r.id}`,
        clientName: r.user?.full_name || `کاربر ${r.user_id}`,
        phone: r.user?.phone || '—',
        vehicleModel: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : '—',
        plateNumber: r.vehicle?.plate || '—',
        issueDescription: r.description,
        status: r.status,
        adminStatus: r.admin_status || 'pending',
        priority: r.priority || 'medium',
        images: r.images?.map((img: string) => getFileUrl(img)) || [],
        audioFiles: r.audio_files?.map((audio: string) => getFileUrl(audio)) || [],
        createdAt: new Date(r.created_at).toLocaleDateString('fa-IR'),
        mechanicName: r.assigned_mechanic?.user?.full_name || null,
      }));
      
      console.log('📸 Formatted images:', formatted[0]?.images);
      console.log('🎵 Formatted audio:', formatted[0]?.audioFiles);
      
      setRequests(formatted);
      setLoading(false);
    };
    loadRequests();
  }, [getAllReports]);

  // ─── توابع تأیید/رد ──────────────────────────────────────────────────────
  const approveRequest = async (id: number) => {
    console.log('✅ Approve request:', id);
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, adminStatus: 'approved' } : r
    ));
  };

  const rejectRequest = async (id: number) => {
    console.log('❌ Reject request:', id);
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, adminStatus: 'rejected' } : r
    ));
  };

  // ─── فیلتر ──────────────────────────────────────────────────────────────────
  const filtered = requests.filter((r) => {
    const matchSearch = 
      (r.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.trackingCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.adminStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = requests.filter((r) => r.adminStatus === 'pending').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center text-[#94A3B8]">
          در حال بارگذاری...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">بررسی درخواست‌ها</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">{pendingCount} درخواست در انتظار تأیید</p>
        </div>

        {/* ─── فیلترها ─── */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
              {[
                { value: 'pending', label: 'در انتظار', count: pendingCount },
                { value: 'approved', label: 'تأیید شده', count: requests.filter((r) => r.adminStatus === 'approved').length },
                { value: 'rejected', label: 'رد شده', count: requests.filter((r) => r.adminStatus === 'rejected').length },
                { value: 'all', label: 'همه', count: requests.length }
              ].map((opt) => (
                <button 
                  key={opt.value} 
                  onClick={() => setStatusFilter(opt.value as any)} 
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    statusFilter === opt.value ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'
                  }`}
                >
                  {opt.label} <span className="mr-1 opacity-60">{opt.count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="جستجو..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B] pr-10 pl-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none lg:w-72" 
            />
          </div>
        </div>

        {/* ─── لیست درخواست‌ها ─── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1E293B] bg-[#1E293B]/50 py-16">
            <Eye className="mb-3 h-12 w-12 text-[#94A3B8]/30" />
            <p className="font-medium text-[#94A3B8]">درخواستی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div key={req.id} className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-5 hover:border-[#3B82F6]/30 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-bold text-[#3B82F6]">#{req.trackingCode}</span>
                      <StatusBadge status={req.status} />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        req.adminStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        req.adminStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                      }`}>
                        {req.adminStatus === 'pending' ? 'در انتظار' : req.adminStatus === 'approved' ? 'تأیید شده' : 'رد شده'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{req.clientName} — {req.vehicleModel}</p>
                    <p className="text-sm text-[#94A3B8] mt-1">{req.issueDescription}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {req.images && req.images.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#94A3B8] bg-[#0F172A] px-2 py-1 rounded-full">
                          <Camera className="h-3 w-3" />{req.images.length} تصویر
                        </span>
                      )}
                      {req.audioFiles && req.audioFiles.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#94A3B8] bg-[#0F172A] px-2 py-1 rounded-full">
                          <Mic className="h-3 w-3" />{req.audioFiles.length} صدا
                        </span>
                      )}
                      {req.mechanicName && (
                        <span className="text-xs text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-1 rounded-full">
                          مکانیک: {req.mechanicName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.adminStatus === 'pending' && (
                      <>
                        <button 
                          onClick={() => approveRequest(req.id)} 
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                          <CheckCircle className="h-4 w-4" />تأیید
                        </button>
                        <button 
                          onClick={() => rejectRequest(req.id)} 
                          className="flex items-center gap-1 rounded-lg bg-[#EF4444]/10 px-4 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/20 transition-all"
                        >
                          <XCircle className="h-4 w-4" />رد
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setSelectedRequest(req)} 
                      className="flex items-center gap-1 rounded-lg bg-[#3B82F6]/10 px-3 py-2 text-xs font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/20"
                    >
                      <Eye className="h-4 w-4" />جزئیات
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Modal جزئیات ─── */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedRequest(null)}>
            <div className="w-full max-w-lg rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-4">جزئیات درخواست #{selectedRequest.trackingCode}</h3>
              <div className="space-y-3 text-sm text-[#94A3B8]">
                <p><span className="text-[#F8FAFC] font-semibold">مشتری:</span> {selectedRequest.clientName}</p>
                <p><span className="text-[#F8FAFC] font-semibold">تلفن:</span> {selectedRequest.phone}</p>
                <p><span className="text-[#F8FAFC] font-semibold">خودرو:</span> {selectedRequest.vehicleModel} ({selectedRequest.plateNumber})</p>
                <p><span className="text-[#F8FAFC] font-semibold">مشکل:</span> {selectedRequest.issueDescription}</p>
                <p><span className="text-[#F8FAFC] font-semibold">تاریخ:</span> {selectedRequest.createdAt}</p>
                <p><span className="text-[#F8FAFC] font-semibold">اولویت:</span> {
                  selectedRequest.priority === 'emergency' ? '🆘 اضطراری' : 
                  selectedRequest.priority === 'urgent' ? '🔴 فوری' : 
                  '🟡 عادی'
                }</p>
                <div className="border-t border-[#0F172A] pt-3 mt-1">
                  <MediaViewer 
                    images={selectedRequest.images} 
                    audioFiles={selectedRequest.audioFiles} 
                  />
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="mt-5 w-full rounded-xl bg-[#0F172A] py-2.5 text-sm font-semibold text-[#94A3B8]">
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}