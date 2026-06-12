const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'در انتظار', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  'in-progress': { label: 'در حال بررسی', className: 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20' },
  completed: { label: 'تکمیل شده', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  cancelled: { label: 'لغو شده', className: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'کم', className: 'bg-[#1E293B] text-[#94A3B8] border border-[#1E293B]' },
  medium: { label: 'متوسط', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  high: { label: 'زیاد', className: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: '' };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>{config.label}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || { label: priority, className: '' };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>{config.label}</span>;
}
