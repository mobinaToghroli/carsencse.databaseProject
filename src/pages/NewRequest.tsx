import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Layout } from '../components/Layout';
import { CheckCircle, ArrowRight, X, Mic, ImagePlus, Car } from 'lucide-react';
import { BackendVehicle } from '../api';

const CATEGORIES = [
  { value: 'engine', label: 'موتور' },
  { value: 'gearbox', label: 'گیربکس' },
  { value: 'electrical', label: 'برق خودرو' },
  { value: 'brakes', label: 'ترمز' },
  { value: 'cooling', label: 'سیستم خنک‌کننده' },
  { value: 'steering', label: 'فرمان' },
  { value: 'body', label: 'بدنه' },
  { value: 'suspension', label: 'تعلیق' },
  { value: 'exhaust', label: 'اگزوز' },
  { value: 'other', label: 'سایر' },
];

export default function NewRequest() {
  const { createReport, getMyVehicles, uploadAttachment } = useApp();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<BackendVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    getMyVehicles().then((list) => {
      setVehicles(list);
      if (list.length === 1) setSelectedVehicleId(list[0].id);
    }).finally(() => setLoadingVehicles(false));
  }, []);

  const [formData, setFormData] = useState({
    issueDescription: '',
    category: 'other',
    priority: 'normal' as 'normal' | 'urgent' | 'emergency',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) { setError('حداکثر ۵ تصویر مجاز است'); return; }
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (audioFiles.length + files.length > 2) { setError('حداکثر ۲ فایل صوتی مجاز است'); return; }
    setAudioFiles((prev) => [...prev, ...files]);
    setAudioUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeAudio = (i: number) => {
    setAudioFiles((prev) => prev.filter((_, idx) => idx !== i));
    setAudioUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (audioFiles.length >= 2) { setError('حداکثر ۲ فایل صوتی مجاز است'); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (ev) => chunks.push(ev.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
          setAudioFiles((prev) => [...prev, file]);
          setAudioUrls((prev) => [...prev, URL.createObjectURL(blob)]);
          stream.getTracks().forEach((t) => t.stop());
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch { alert('دسترسی به میکروفون امکان‌پذیر نیست.'); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedVehicleId) { setError('لطفاً یک خودرو انتخاب کنید'); return; }
    if (formData.issueDescription.trim().length < 10) { setError('شرح مشکل باید حداقل ۱۰ کاراکتر باشد'); return; }

    setSubmitting(true);
    const report = await createReport({
      vehicle_id: selectedVehicleId,
      title: formData.issueDescription.trim().slice(0, 50),
      description: formData.issueDescription.trim(),
      category: formData.category,
      priority: formData.priority,
    });

    if (!report) { setError('خطا در ثبت درخواست. دوباره تلاش کنید.'); setSubmitting(false); return; }

    for (const file of imageFiles) await uploadAttachment(report.id, file);
    for (const file of audioFiles) await uploadAttachment(report.id, file);

    setSubmitting(false);
    setSubmitted(report.id);
  };

  if (submitted !== null) {
    return (
      <Layout>
        <div className="flex min-h-[80vh] items-center justify-center p-8">
          <div className="max-w-md rounded-2xl border border-[#06B6D4]/20 bg-[#1E293B] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#06B6D4]/10">
              <CheckCircle className="h-8 w-8 text-[#06B6D4]" />
            </div>
            <h2 className="text-xl font-bold text-white">درخواست با موفقیت ثبت شد</h2>
            <p className="mt-2 text-sm text-[#94A3B8]">مکانیک‌های موجود می‌توانند درخواست شما را قبول کنند.</p>
            <p className="mt-1 text-sm text-[#94A3B8]">شماره درخواست: <span className="font-mono text-base font-bold text-[#06B6D4]">#{submitted}</span></p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => navigate('/user/history')} className="flex-1 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-4 py-2.5 text-sm font-semibold text-white">مشاهده تاریخچه</button>
              <button onClick={() => { setSubmitted(null); setFormData({ issueDescription: '', category: 'other', priority: 'normal' }); setImageFiles([]); setImagePreviews([]); setAudioFiles([]); setAudioUrls([]); }} className="flex-1 rounded-lg border border-[#1E293B] bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-[#94A3B8]">ثبت درخواست جدید</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">ثبت خرابی جدید</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">اطلاعات خرابی خودروی خود را وارد کنید</p>
        </div>

        <div className="max-w-2xl rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* انتخاب خودرو */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#94A3B8]">انتخاب خودرو <span className="text-[#EF4444]">*</span></label>
              {loadingVehicles ? (
                <p className="text-sm text-[#94A3B8]">در حال بارگذاری خودروها...</p>
              ) : vehicles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#3B82F6]/30 bg-[#0F172A] p-4 text-center">
                  <Car className="mx-auto mb-2 h-8 w-8 text-[#3B82F6]/40" />
                  <p className="text-sm text-[#94A3B8]">ابتدا یک خودرو ثبت کنید</p>
                  <Link to="/user/vehicles" className="mt-2 inline-block text-sm text-[#3B82F6] hover:underline">افزودن خودرو</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vehicles.map((v) => (
                    <button key={v.id} type="button" onClick={() => setSelectedVehicleId(v.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 text-right transition-all ${selectedVehicleId === v.id ? 'border-[#3B82F6] bg-[#3B82F6]/10' : 'border-[#0F172A] bg-[#0F172A] hover:border-[#3B82F6]/40'}`}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B82F6]/10 flex-shrink-0">
                        <Car className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{v.display_name}</p>
                        {v.plate && <p className="text-xs text-[#94A3B8] font-mono">{v.plate}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* دسته‌بندی */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#94A3B8]">دسته‌بندی مشکل</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${formData.category === cat.value ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#0F172A] bg-[#0F172A] text-[#94A3B8] hover:border-[#3B82F6]/30'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* اولویت */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#94A3B8]">اولویت</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ value: 'normal', label: 'عادی' }, { value: 'urgent', label: 'فوری' }, { value: 'emergency', label: 'اضطراری' }].map((p) => (
                  <button key={p.value} type="button" onClick={() => setFormData({ ...formData, priority: p.value as any })}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${formData.priority === p.value ? (p.value === 'emergency' ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]' : p.value === 'urgent' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#94A3B8] bg-[#94A3B8]/10 text-[#94A3B8]') : 'border-[#0F172A] bg-[#0F172A] text-[#94A3B8]'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* شرح مشکل */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#94A3B8]">شرح مشکل <span className="text-[#EF4444]">*</span></label>
              <textarea value={formData.issueDescription} onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                rows={4} placeholder="مشکل خودروی خود را با جزئیات شرح دهید..."
                className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none resize-none" required />
              <p className="mt-1 text-xs text-[#94A3B8]">{formData.issueDescription.length} کاراکتر</p>
            </div>

            {/* تصاویر */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#94A3B8]">تصاویر (حداکثر ۵ عدد، هر فایل تا ۵MB)</label>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#1E293B]">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-white"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {imageFiles.length < 5 && (
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#3B82F6]/30 bg-[#0F172A] hover:border-[#3B82F6]/60">
                    <div className="text-center"><ImagePlus className="mx-auto h-6 w-6 text-[#3B82F6]" /><span className="mt-1 block text-[10px] text-[#94A3B8]">افزودن</span></div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* صدا */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#94A3B8]">صدا (حداکثر ۲ فایل، هر فایل تا ۱۰MB)</label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={toggleRecording} disabled={audioFiles.length >= 2}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 ${isRecording ? 'animate-pulse bg-[#EF4444]/20 text-[#EF4444]' : 'border border-[#1E293B] bg-[#0F172A] text-[#94A3B8] hover:text-white'}`}>
                  <Mic className={`h-4 w-4 ${isRecording ? 'text-[#EF4444]' : ''}`} />
                  {isRecording ? 'در حال ضبط... (کلیک برای پایان)' : 'ضبط صدا'}
                </button>
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-[#94A3B8] hover:text-white ${audioFiles.length >= 2 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <ImagePlus className="h-4 w-4" />آپلود فایل صوتی
                  <input type="file" accept="audio/*" multiple className="hidden" disabled={audioFiles.length >= 2} onChange={handleAudioUpload} />
                </label>
              </div>
              {audioUrls.length > 0 && (
                <div className="mt-3 space-y-2">
                  {audioUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-3 py-2">
                      <Mic className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                      <audio controls src={url} className="h-8 max-w-full flex-1" />
                      <button type="button" onClick={() => removeAudio(i)} className="text-[#EF4444]"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-3 text-sm text-[#EF4444]">⚠️ {error}</div>}

            <button type="submit" disabled={submitting || !selectedVehicleId || vehicles.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50">
              {submitting ? (<><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>در حال ثبت...</>) : (<>ثبت درخواست <ArrowRight className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
