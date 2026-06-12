import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { Car, Plus, Trash2, X, Pencil } from 'lucide-react';
import { BackendVehicle } from '../api';

// فرم خالی — brand و model جدا هستند
const emptyForm = { brand: '', model: '', plateNumber: '', year: '', color: '', type: '' };

export default function UserVehicles() {
  const { getMyVehicles, addVehicle, updateVehicle, deleteVehicle } = useApp();

  // لیست خودروها از بکند
  const [myVehicles, setMyVehicles] = useState<BackendVehicle[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ─── بارگذاری لیست از بکند ─────────────────────────────────────────────────
  const loadVehicles = () => {
    setLoadingList(true);
    getMyVehicles()
      .then(setMyVehicles)
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // ─── باز کردن فرم افزودن ───────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null);
    setFormData(emptyForm);
    setError('');
    setShowForm(true);
  };

  // ─── باز کردن فرم ویرایش ──────────────────────────────────────────────────
  const openEdit = (v: BackendVehicle) => {
    setEditId(v.id);
    setFormData({
      brand: v.brand,
      model: v.model,
      plateNumber: v.plate || '',
      year: String(v.year),
      color: v.color || '',
      type: '',   // بکند فعلاً type ندارد
    });
    setError('');
    setShowForm(true);
  };

  // ─── ارسال فرم ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.brand.trim()) {
      setError('نام خودرو الزامی است');
      return;
    }

    setSubmitting(true);

    if (editId !== null) {
      // ویرایش خودرو موجود
      const ok = await updateVehicle(editId, {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        plate: formData.plateNumber.trim() || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color.trim() || undefined,
      });
      if (!ok) setError('خطا در ویرایش خودرو. دوباره تلاش کنید.');
    } else {
      // افزودن خودرو جدید
      const vehicle = await addVehicle({
        brand: formData.brand.trim(),
        model: formData.model.trim() || formData.brand.trim(),
        plate: formData.plateNumber.trim() || undefined,
        year: formData.year ? parseInt(formData.year) : new Date().getFullYear(),
        color: formData.color.trim() || undefined,
      });
      if (!vehicle) setError('خطا در ثبت خودرو. دوباره تلاش کنید.');
    }

    setSubmitting(false);
    loadVehicles();   // لیست رو از نو بگیر
    setShowForm(false);
    setFormData(emptyForm);
    setEditId(null);
  };

  // ─── حذف خودرو ────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این خودرو مطمئن هستید؟')) return;
    await deleteVehicle(id);
    loadVehicles();
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">مشخصات خودرو</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">
              مدیریت خودروهای شما ({myVehicles.length} خودرو)
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />افزودن خودرو
          </button>
        </div>

        {/* ─── فرم افزودن / ویرایش ─── */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowForm(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editId ? 'ویرایش خودرو' : 'افزودن خودروی جدید'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#0F172A]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* برند/نام خودرو */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      برند خودرو <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="مثال: پژو"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                      required
                    />
                  </div>

                  {/* مدل */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      مدل
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="مثال: ۲۰۶"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* پلاک */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                    شماره پلاک
                  </label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="مثال: ۱۲ع۳۴۵۶۷"
                    className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* سال */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      سال ساخت
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="مثال: 1401"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  {/* رنگ */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#94A3B8]">
                      رنگ
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="سفید"
                      className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">
                    ⚠️ {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {submitting ? 'در حال ذخیره...' : editId ? 'ذخیره تغییرات' : 'ثبت خودرو'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-lg bg-[#0F172A] py-2.5 text-sm font-semibold text-[#94A3B8]"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── لیست خودروها ─── */}
        {loadingList ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin text-[#3B82F6]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : myVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1E293B] bg-[#1E293B]/50 py-20">
            <Car className="mb-4 h-16 w-16 text-[#3B82F6]/20" />
            <p className="text-base font-medium text-[#94A3B8]">هنوز خودرویی ثبت نکرده‌اید</p>
            <p className="mt-1 text-sm text-[#94A3B8]/60">برای شروع روی «افزودن خودرو» کلیک کنید</p>
            <button
              onClick={openAdd}
              className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />افزودن اولین خودرو
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myVehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20">
                    <Car className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(v)}
                      className="rounded-lg p-2 text-[#94A3B8]/60 transition-colors hover:bg-[#3B82F6]/10 hover:text-[#3B82F6]"
                      title="ویرایش"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="rounded-lg p-2 text-[#94A3B8]/60 transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* نام خودرو */}
                <h3 className="text-base font-bold text-white">{v.display_name}</h3>

                {/* پلاک */}
                {v.plate && (
                  <p className="mt-1 font-mono text-sm text-[#94A3B8]">{v.plate}</p>
                )}

                {/* تگ‌های اطلاعات */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#0F172A] px-2.5 py-1 text-xs text-[#94A3B8]">
                    {v.year}
                  </span>
                  {v.color && (
                    <span className="rounded-full bg-[#0F172A] px-2.5 py-1 text-xs text-[#94A3B8]">
                      {v.color}
                    </span>
                  )}
                  <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-1 text-xs text-[#3B82F6]">
                    {v.fuel_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
