import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { Search, CheckCircle, XCircle, Eye, UserCheck, MapPin, Award, Star, Phone, Building, User, Mail } from 'lucide-react';

export default function AdminMechanics() {
  const { getPendingMechanics, verifyMechanic, revokeMechanic } = useApp();
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  useEffect(() => {
    const loadMechanics = async () => {
      setLoading(true);
      const data = await getPendingMechanics();
      
      const formatted = (data || []).map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        fullName: m.full_name || m.user?.full_name || 'مکانیک',
        workshopName: m.workshop_name || 'تعمیرگاه',
        specialty: m.specializations?.map((s: any) => s.name).join('، ') || 'تخصص ثبت نشده',
        phone: m.user?.phone || '—',
        email: m.user?.email || '—',
        address: m.address || '—',
        nationalId: m.national_id || '—',
        experienceYears: m.years_of_experience || 0,
        totalRatings: m.total_ratings || 0,
        avgRating: m.average_rating || 0,
        approvalStatus: m.approval_status || 'pending',
        bio: m.bio || '—',
        city: m.city || '—',
        isVerified: m.is_verified || false,
        avatarUrl: m.user?.avatar_url || m.avatar_url || null,  // ← مهم
      }));
      
      setMechanics(formatted);
      setLoading(false);
    };
    loadMechanics();
  }, [getPendingMechanics]);

  const handleVerify = async (mechanicId: number) => {
    const ok = await verifyMechanic(mechanicId);
    if (ok) {
      setMechanics(prev => prev.map(m => 
        m.id === mechanicId ? { ...m, approvalStatus: 'approved', isVerified: true } : m
      ));
    } else {
      alert('خطا در تأیید مکانیک');
    }
  };

  const handleRevoke = async (mechanicId: number) => {
    const ok = await revokeMechanic(mechanicId);
    if (ok) {
      setMechanics(prev => prev.map(m => 
        m.id === mechanicId ? { ...m, approvalStatus: 'rejected', isVerified: false } : m
      ));
    } else {
      alert('خطا در رد مکانیک');
    }
  };

  const filtered = mechanics.filter((m) => {
    const matchSearch = 
      (m.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (m.workshopName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || m.approvalStatus === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = mechanics.filter((m) => m.approvalStatus === 'pending').length;

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (avatarUrl) {
      return `http://localhost:8000${avatarUrl}`;
    }
    return null;
  };

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
          <h1 className="text-2xl font-black text-white">تأیید مکانیک‌ها</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">{pendingCount} مکانیک در انتظار تأیید</p>
        </div>

        {/* ─── فیلترها ─── */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
              {[
                { value: 'pending', label: 'در انتظار', count: pendingCount },
                { value: 'approved', label: 'تأیید شده', count: mechanics.filter((m) => m.approvalStatus === 'approved').length },
                { value: 'rejected', label: 'رد شده', count: mechanics.filter((m) => m.approvalStatus === 'rejected').length },
                { value: 'all', label: 'همه', count: mechanics.length }
              ].map((opt) => (
                <button 
                  key={opt.value} 
                  onClick={() => setFilter(opt.value as any)} 
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filter === opt.value ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'
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

        {/* ─── لیست مکانیک‌ها ─── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1E293B] bg-[#1E293B]/50 py-16">
            <UserCheck className="mb-3 h-12 w-12 text-[#94A3B8]/30" />
            <p className="font-medium text-[#94A3B8]">مکانیکی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => {
              const avatarUrl = getAvatarUrl(m.avatarUrl);
              return (
                <div key={m.id} className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-5 hover:border-[#3B82F6]/30 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    {/* ─── آواتار ─── */}
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={m.fullName}
                        className="h-14 w-14 rounded-xl object-cover border-2 border-[#3B82F6]"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-xl font-black text-white">
                        {(m.fullName || 'م').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{m.fullName}</h3>
                      <p className="text-xs text-[#94A3B8] truncate">{m.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {m.totalRatings > 0 ? (
                          <>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-amber-400">{m.avgRating.toFixed(1)}</span>
                          </>
                        ) : (
                          <span className="text-xs text-[#94A3B8]/60">بدون امتیاز</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#94A3B8] mb-4">
                    {m.phone && m.phone !== '—' && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-[#3B82F6]" />
                        {m.phone}
                      </p>
                    )}
                    {m.email && m.email !== '—' && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#3B82F6]" />
                        {m.email}
                      </p>
                    )}
                    {m.workshopName && m.workshopName !== 'تعمیرگاه' && (
                      <p className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-[#3B82F6]" />
                        {m.workshopName}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#3B82F6]" />
                      {m.city || m.address || 'شهر ثبت نشده'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-[#3B82F6]" />
                      {m.experienceYears} سال تجربه
                    </p>
                    {m.nationalId && m.nationalId !== '—' && (
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-[#3B82F6]" />
                        کد ملی: {m.nationalId}
                      </p>
                    )}
                    {m.bio && m.bio !== '—' && (
                      <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1">{m.bio}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.approvalStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                      m.approvalStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                      'bg-[#EF4444]/10 text-[#EF4444]'
                    }`}>
                      {m.approvalStatus === 'pending' ? 'در انتظار' : 
                       m.approvalStatus === 'approved' ? 'تأیید شده' : 'رد شده'}
                    </span>
                    <div className="flex gap-2">
                      {m.approvalStatus === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleVerify(m.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />تأیید
                          </button>
                          <button 
                            onClick={() => handleRevoke(m.id)}
                            className="flex items-center gap-1 rounded-lg bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/20"
                          >
                            <XCircle className="h-3.5 w-3.5" />رد
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setSelectedProfile(m)} 
                        className="flex items-center gap-1 rounded-lg bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/20"
                      >
                        <Eye className="h-3.5 w-3.5" />پروفایل
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Modal پروفایل ─── */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedProfile(null)}>
            <div className="w-full max-w-lg rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-2xl font-black text-white">
                  {(selectedProfile.fullName || 'م').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedProfile.fullName}</h3>
                  <p className="text-sm text-[#94A3B8]">{selectedProfile.specialty}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-[#94A3B8]">
                <p><span className="text-[#F8FAFC] font-semibold">تلفن:</span> {selectedProfile.phone || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">ایمیل:</span> {selectedProfile.email || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">آدرس:</span> {selectedProfile.address || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">تعمیرگاه:</span> {selectedProfile.workshopName || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">شهر:</span> {selectedProfile.city || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">تجربه:</span> {selectedProfile.experienceYears} سال</p>
                <p><span className="text-[#F8FAFC] font-semibold">کد ملی:</span> {selectedProfile.nationalId || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">درباره:</span> {selectedProfile.bio || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">وضعیت:</span> {selectedProfile.isVerified ? '✓ تأیید شده' : '⏳ در انتظار تأیید'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">امتیاز:</span> {selectedProfile.totalRatings > 0 ? `${selectedProfile.avgRating.toFixed(1)} از ۵ (${selectedProfile.totalRatings} نظر)` : 'بدون امتیاز'}</p>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="mt-5 w-full rounded-xl bg-[#0F172A] py-2.5 text-sm font-semibold text-[#94A3B8]">
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}