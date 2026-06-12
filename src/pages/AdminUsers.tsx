import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { Search, Eye, Ban, Trash2, Shield, User, UserCheck, Lock } from 'lucide-react';

export default function AdminUsers() {
  const { users, blockUser, activateUser, deleteUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'mechanic' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleLabel = (r: string) => r === 'admin' ? 'ادمین' : r === 'mechanic' ? 'مکانیک' : 'کاربر';
  const roleIcon = (r: string) => r === 'admin' ? <Shield className="h-4 w-4 text-[#3B82F6]" /> : r === 'mechanic' ? <UserCheck className="h-4 w-4 text-[#06B6D4]" /> : <User className="h-4 w-4 text-[#94A3B8]" />;

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6"><h1 className="text-2xl font-black text-white">مدیریت کاربران</h1><p className="mt-1 text-sm text-[#94A3B8]">{users.length} کاربر در سیستم</p></div>

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#1E293B] p-1">
              {[{ value: 'all', label: 'همه', count: users.length }, { value: 'user', label: 'کاربران', count: users.filter((u) => u.role === 'user').length }, { value: 'mechanic', label: 'مکانیک‌ها', count: users.filter((u) => u.role === 'mechanic').length }, { value: 'admin', label: 'ادمین', count: users.filter((u) => u.role === 'admin').length }].map((opt) => (
                <button key={opt.value} onClick={() => setRoleFilter(opt.value as any)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${roleFilter === opt.value ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:bg-[#0F172A]'}`}>{opt.label} <span className="mr-1 opacity-60">{opt.count}</span></button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B] pr-10 pl-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none lg:w-72" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#1E293B]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#0F172A]">
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">کاربر</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">ایمیل</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">نقش</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">وضعیت</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#94A3B8]">تاریخ عضویت</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-[#94A3B8]">عملیات</th>
              </tr></thead>
              <tbody className="divide-y divide-[#0F172A]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#0F172A] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-sm font-bold text-white">{u.fullName.charAt(0)}</div>
                        <span className="text-sm font-semibold text-white">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#94A3B8]">{u.email}</td>
                    <td className="px-5 py-4"><span className="flex items-center gap-1 text-sm text-[#94A3B8]">{roleIcon(u.role)}{roleLabel(u.role)}</span></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>{u.isActive ? 'فعال' : 'مسدود'}</span></td>
                    <td className="px-5 py-4 text-sm text-[#94A3B8]">{u.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setSelectedUser(u)} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#3B82F6]/10 hover:text-[#3B82F6]" title="مشاهده"><Eye className="h-4 w-4" /></button>
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => u.isActive ? blockUser(u.id) : activateUser(u.id)} className={`rounded-lg p-1.5 ${u.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`} title={u.isActive ? 'مسدود' : 'فعال‌سازی'}>{u.isActive ? <Ban className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</button>
                            <button onClick={() => { if (confirm('آیا از حذف این کاربر مطمئن هستید؟')) deleteUser(u.id); }} className="rounded-lg p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10" title="حذف"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedUser(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-2xl font-black text-white">{selectedUser.fullName.charAt(0)}</div>
                <div><h3 className="text-lg font-bold text-white">{selectedUser.fullName}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${selectedUser.role === 'admin' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : selectedUser.role === 'mechanic' ? 'bg-[#06B6D4]/10 text-[#06B6D4]' : 'bg-[#94A3B8]/10 text-[#94A3B8]'}`}>{roleLabel(selectedUser.role)}</span></div>
              </div>
              <div className="space-y-3 text-sm text-[#94A3B8]">
                <p><span className="text-[#F8FAFC] font-semibold">ایمیل:</span> {selectedUser.email}</p>
                <p><span className="text-[#F8FAFC] font-semibold">تلفن:</span> {selectedUser.phone || '—'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">وضعیت:</span> {selectedUser.isActive ? 'فعال' : 'مسدود'}</p>
                <p><span className="text-[#F8FAFC] font-semibold">تاریخ عضویت:</span> {selectedUser.createdAt}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="mt-5 w-full rounded-xl bg-[#0F172A] py-2.5 text-sm font-semibold text-[#94A3B8]">بستن</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
