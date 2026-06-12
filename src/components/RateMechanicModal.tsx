import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Star, X, CheckCircle } from 'lucide-react';
import { ClientRequest } from '../data';

interface Props {
  request: ClientRequest;
  onClose: () => void;
}

export function RateMechanicModal({ request, onClose }: Props) {
  const { rateMechanic } = useApp();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const alreadyRated = !!request.rating;

  const handleSubmit = () => {
    if (score === 0) return;
    rateMechanic(request.id, score, comment);
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">امتیاز به مکانیک</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#0F172A]"><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="h-14 w-14 text-emerald-400 mb-3" />
            <p className="text-white font-semibold">امتیاز شما ثبت شد</p>
            <p className="text-sm text-[#94A3B8] mt-1">از بازخورد شما سپاسگزاریم</p>
          </div>
        ) : alreadyRated ? (
          <div className="py-6 text-center">
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-7 w-7 ${s <= request.rating!.score ? 'fill-amber-400 text-amber-400' : 'text-[#94A3B8]/30'}`} />
              ))}
            </div>
            <p className="text-white font-semibold">شما قبلاً امتیاز داده‌اید</p>
            {request.rating!.comment && <p className="text-sm text-[#94A3B8] mt-2 bg-[#0F172A] rounded-lg p-3">{request.rating!.comment}</p>}
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-[#94A3B8] mb-3">مکانیک: <span className="text-white font-semibold">{request.mechanicName}</span></p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setScore(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110">
                    <Star className={`h-9 w-9 ${s <= (hover || score) ? 'fill-amber-400 text-amber-400' : 'text-[#94A3B8]/30'}`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#94A3B8] mt-2 h-4">
                {(hover || score) === 1 && 'خیلی ضعیف'}
                {(hover || score) === 2 && 'ضعیف'}
                {(hover || score) === 3 && 'متوسط'}
                {(hover || score) === 4 && 'خوب'}
                {(hover || score) === 5 && 'عالی'}
              </p>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="نظر شما درباره کیفیت کار (اختیاری)..."
              className="w-full rounded-lg border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={score === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-3 text-sm font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star className="h-4 w-4" />
              ثبت امتیاز
            </button>
          </>
        )}
      </div>
    </div>
  );
}
