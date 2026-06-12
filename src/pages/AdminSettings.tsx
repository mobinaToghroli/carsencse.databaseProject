import { useApp } from '../contexts/AppContext';
import { AdminLayout } from '../components/AdminLayout';
import { ChangePassword } from '../components/ChangePassword';
import { Shield } from 'lucide-react';

export default function AdminSettings() {
  const { currentUser } = useApp();

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6"><h1 className="text-2xl font-black text-white">تنظیمات</h1><p className="mt-1 text-sm text-[#94A3B8]">مدیریت حساب کاربری</p></div>

        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]"><Shield className="h-8 w-8 text-white" /></div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentUser?.fullName}</h2>
                <p className="text-sm text-[#94A3B8]">{currentUser?.email}</p>
                <span className="mt-1 inline-flex rounded-full bg-[#3B82F6]/10 px-3 py-0.5 text-xs font-medium text-[#3B82F6]">مدیر سیستم</span>
              </div>
            </div>
          </div>

          <ChangePassword />
        </div>
      </div>
    </AdminLayout>
  );
}
