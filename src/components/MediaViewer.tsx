import { useState } from 'react';
import { Camera, Mic, Download, X, ZoomIn } from 'lucide-react';

interface MediaViewerProps {
  images?: string[];
  audioFiles?: string[];
}

// ─── تابع کمکی برای ساخت URL صحیح ──────────────────────────────────────────
const getFileUrl = (path: string): string => {
  if (!path) return '';
  
  // اگر path با "uploads/" شروع میشه
  if (path.startsWith('uploads/')) {
    return `http://localhost:8000/${path}`;
  }
  
  // اگر path با "http" شروع میشه (قبلاً کامل شده)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // در غیر این صورت، uploads رو اضافه کن
  return `http://localhost:8000/uploads/${path}`;
};

function downloadFile(url: string, filename: string) {
  // اگر url کامل نیست، کاملش کن
  const fullUrl = url.startsWith('http') ? url : getFileUrl(url);
  
  const a = document.createElement('a');
  a.href = fullUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function MediaViewer({ images = [], audioFiles = [] }: MediaViewerProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (images.length === 0 && audioFiles.length === 0) {
    return <p className="text-sm text-[#94A3B8]/60">رسانه‌ای پیوست نشده است.</p>;
  }

  return (
    <div className="space-y-4">
      {/* ─── تصاویر ─── */}
      {images.length > 0 && (
        <div>
          <p className="text-[#F8FAFC] font-semibold mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#3B82F6]" />
            تصاویر ({images.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => {
              const imageUrl = getFileUrl(img);
              return (
                <div key={i} className="group relative rounded-lg overflow-hidden border border-[#0F172A]">
                  <img
                    src={imageUrl}
                    alt={`تصویر ${i + 1}`}
                    className="h-24 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setLightbox(imageUrl)}
                    onError={(e) => {
                      // اگر تصویر لود نشد، یه placeholder نشون بده
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setLightbox(imageUrl)}
                      className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/40 backdrop-blur-sm"
                      title="بزرگنمایی"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadFile(img, `image-${i + 1}.jpg`)}
                      className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/40 backdrop-blur-sm"
                      title="دانلود"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── فایل‌های صوتی ─── */}
      {audioFiles.length > 0 && (
        <div>
          <p className="text-[#F8FAFC] font-semibold mb-2 flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#3B82F6]" />
            فایل‌های صوتی ({audioFiles.length})
          </p>
          <div className="space-y-2">
            {audioFiles.map((a, i) => {
              const audioUrl = getFileUrl(a);
              const isPlayable = audioUrl.startsWith('http') || audioUrl.startsWith('blob:') || audioUrl.startsWith('data:');
              
              return (
                <div key={i} className="flex items-center justify-between gap-2 bg-[#0F172A] px-3 py-2.5 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Mic className="h-4 w-4 text-[#3B82F6] flex-shrink-0" />
                    {isPlayable ? (
                      <audio controls src={audioUrl} className="h-8 max-w-full" />
                    ) : (
                      <span className="text-xs text-[#94A3B8] truncate">پیام صوتی {i + 1}</span>
                    )}
                  </div>
                  <button
                    onClick={() => downloadFile(a, `audio-${i + 1}.mp3`)}
                    className="flex items-center gap-1 rounded-lg bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/20 flex-shrink-0"
                    title="دانلود"
                  >
                    <Download className="h-3.5 w-3.5" />
                    دانلود
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Lightbox برای بزرگنمایی ─── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 left-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); downloadFile(lightbox, 'image.jpg'); }}
            className="absolute top-4 left-20 flex items-center gap-2 rounded-full bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB]"
          >
            <Download className="h-5 w-5" />
            دانلود
          </button>
          <img
            src={lightbox}
            alt="نمایش بزرگ"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}