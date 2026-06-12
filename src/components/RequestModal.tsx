import { useState } from 'react';
import { ClientRequest, Repair } from '../data';
import { MediaViewer } from './MediaViewer';
import { X, Plus, Package, Clock, DollarSign, User } from 'lucide-react';

type TabType = 'details' | 'repairs' | 'edit';

interface RequestModalProps { request: ClientRequest; onClose: () => void; onRepairAdd: (requestId: string, repair: Omit<Repair, 'id' | 'date'>) => void; onUpdate: (request: ClientRequest) => void; editable?: boolean; }

export function RequestModal({ request, onClose, onRepairAdd, onUpdate, editable = true }: RequestModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [formData, setFormData] = useState<ClientRequest>({ ...request });
  const [repairForm, setRepairForm] = useState({ description: '', partsUsed: '', laborHours: '', cost: '', mechanic: '', status: 'in-progress' as Repair['status'] });
  const [repairError, setRepairError] = useState('');
  const [editSaved, setEditSaved] = useState(false);

  const statusOptions = [{ value: 'pending', label: 'در انتظار' }, { value: 'in-progress', label: 'در حال انجام' }, { value: 'completed', label: 'تکمیل شده' }, { value: 'cancelled', label: 'لغو شده' }];
  const priorityOptions = [{ value: 'low', label: 'کم' }, { value: 'medium', label: 'متوسط' }, { value: 'high', label: 'زیاد' }];

  const handleSave = () => { onUpdate(formData); setEditSaved(true); setTimeout(() => setEditSaved(false), 2500); };

  const handleAddRepair = () => {
    setRepairError('');
    if (!repairForm.description.trim()) { setRepairError('توضیحات تعمیر الزامی است'); return; }
    if (!repairForm.mechanic.trim()) { setRepairError('نام مکانیک الزامی است'); return; }
    onRepairAdd(request.id, { description: repairForm.description.trim(), partsUsed: repairForm.partsUsed.split(',').map((p) => p.trim()).filter(Boolean), laborHours: parseFloat(repairForm.laborHours) || 0, cost: parseFloat(repairForm.cost) || 0, mechanic: repairForm.mechanic.trim(), status: repairForm.status });
    setRepairForm({ description: '', partsUsed: '', laborHours: '', cost: '', mechanic: '', status: 'in-progress' });
  };

  const tabs = [{ id: 'details', label: 'جزئیات', icon: '📋' }, { id: 'repairs', label: `تعمیرات (${request.repairs?.length || 0})`, icon: '🔧' }, ...(editable ? [{ id: 'edit', label: 'ویرایش', icon: '✏️' }] : [])];
  const statusColor = (s: string) => { switch (s) { case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; case 'in-progress': return 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'; case 'cancelled': return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'; default: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'; } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#1E293B] bg-[#1E293B] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 border-b border-[#0F172A]">
          <div className="flex items-center justify-between px-6 py-4">
            <div><h2 className="text-lg font-bold text-white">{request.clientName}<span className="mr-2 text-sm font-normal text-[#94A3B8]">|</span><span className="text-sm font-medium text-[#94A3B8]">{request.vehicleModel}</span></h2><p className="mt-0.5 text-xs text-[#94A3B8]">کد پیگیری: <span className="font-mono font-bold text-[#3B82F6]">{request.trackingCode}</span></p></div>
            <button onClick={onClose} className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#0F172A] hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex">
            {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-[#3B82F6] text-[#3B82F6]' : 'text-[#94A3B8] hover:text-white'}`}><span className="ml-1.5">{tab.icon}</span>{tab.label}</button>))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="نام مشتری" value={request.clientName} />
                <InfoBox label="شماره تماس" value={request.phone} />
                <InfoBox label="مدل خودرو" value={request.vehicleModel} />
                <InfoBox label="شماره پلاک" value={request.plateNumber} />
                <InfoBox label="تاریخ درخواست" value={request.createdAt} />
                <InfoBox label="وضعیت" value={<span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(request.status)}`}>{statusOptions.find((s) => s.value === request.status)?.label}</span>} />
              </div>
              <div><h4 className="mb-2 text-sm font-semibold text-[#94A3B8]">توضیحات مشکل</h4><p className="rounded-xl bg-[#0F172A] p-4 text-sm leading-relaxed text-[#F8FAFC]">{request.issueDescription}</p></div>
              {((request.images && request.images.length > 0) || (request.audioFiles && request.audioFiles.length > 0)) && (
                <div><h4 className="mb-2 text-sm font-semibold text-[#94A3B8]">رسانه‌های پیوست</h4><MediaViewer images={request.images} audioFiles={request.audioFiles} /></div>
              )}
              {request.mechanicNotes && <div><h4 className="mb-2 text-sm font-semibold text-[#94A3B8]">یادداشت مکانیک</h4><p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-400">{request.mechanicNotes}</p></div>}
              {request.repairs?.length > 0 && <div><h4 className="mb-3 text-sm font-semibold text-[#94A3B8]">تعمیرات ({request.repairs.length})</h4><div className="space-y-3">{request.repairs.map((r) => <RepairCard key={r.id} repair={r} />)}</div></div>}
              {(request.cost || 0) > 0 && <div className="flex items-center justify-between rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-4"><span className="font-bold text-[#3B82F6]">هزینه کل:</span><span className="text-xl font-bold text-[#3B82F6]">{(request.cost || 0).toLocaleString('fa-IR')} تومان</span></div>}
            </div>
          )}

          {activeTab === 'repairs' && (
            <div className="space-y-6">
              {editable && (
                <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-5">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><Plus className="h-4 w-4 text-[#3B82F6]" />ثبت تعمیر جدید</h4>
                  <div className="space-y-3">
                    <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">توضیحات تعمیر <span className="text-[#EF4444]">*</span></label><input type="text" placeholder="مثال: تعویض فیلتر روغن" value={repairForm.description} onChange={(e) => setRepairForm({ ...repairForm, description: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>
                    <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">نام مکانیک <span className="text-[#EF4444]">*</span></label><input type="text" placeholder="نام مکانیک" value={repairForm.mechanic} onChange={(e) => setRepairForm({ ...repairForm, mechanic: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>
                    <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">قطعات استفاده شده</label><input type="text" placeholder="فیلتر روغن، روغن موتور" value={repairForm.partsUsed} onChange={(e) => setRepairForm({ ...repairForm, partsUsed: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">ساعت کار</label><input type="number" min="0" step="0.5" placeholder="" value={repairForm.laborHours} onChange={(e) => setRepairForm({ ...repairForm, laborHours: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>
                      <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">هزینه (تومان)</label><input type="number" min="0" placeholder="۰" value={repairForm.cost} onChange={(e) => setRepairForm({ ...repairForm, cost: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>
                    </div>
                    <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">وضعیت تعمیر</label><select value={repairForm.status} onChange={(e) => setRepairForm({ ...repairForm, status: e.target.value as Repair['status'] })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"><option value="pending">در انتظار</option><option value="in-progress">در حال انجام</option><option value="completed">تکمیل شده</option></select></div>
                    {repairError && <p className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 px-3 py-2 text-xs text-[#EF4444]">⚠️ {repairError}</p>}
                    <button onClick={handleAddRepair} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-2.5 text-sm font-semibold text-white hover:shadow-lg active:scale-95 transition-all"><Plus className="h-4 w-4" />ثبت تعمیر</button>
                  </div>
                </div>
              )}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-[#94A3B8]">لیست تعمیرات {request.repairs?.length > 0 && `(${request.repairs.length})`}</h4>
                {!request.repairs || request.repairs.length === 0 ? (<div className="flex flex-col items-center py-10 text-center"><span className="mb-2 text-4xl">🔧</span><p className="text-sm text-[#94A3B8]">هنوز تعمیری ثبت نشده</p>{editable && <p className="mt-1 text-xs text-[#94A3B8]/60">از فرم بالا تعمیر جدید ثبت کنید</p>}</div>) : (<div className="space-y-3">{request.repairs.map((r) => <RepairCard key={r.id} repair={r} />)}</div>)}
              </div>
            </div>
          )}

          {activeTab === 'edit' && editable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">نام مشتری</label><input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" /></div>
                <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">شماره تماس</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" /></div>
                <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">مدل خودرو</label><input type="text" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" /></div>
                <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">شماره پلاک</label><input type="text" value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">توضیحات مشکل</label><textarea value={formData.issueDescription} onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })} rows={3} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">یادداشت مکانیک</label><textarea value={formData.mechanicNotes || ''} onChange={(e) => setFormData({ ...formData, mechanicNotes: e.target.value })} rows={2} placeholder="یادداشت داخلی..." className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">وضعیت</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientRequest['status'] })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none">{statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-[#94A3B8]">اولویت</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as ClientRequest['priority'] })} className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none">{priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              </div>
              {editSaved && <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-400">✅ تغییرات ذخیره شد</p>}
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-2.5 text-sm font-semibold text-white">ذخیره تغییرات</button>
                <button onClick={onClose} className="flex-1 rounded-xl bg-[#0F172A] py-2.5 text-sm font-semibold text-[#94A3B8]">بستن</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (<div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-3"><p className="mb-1 text-xs font-medium text-[#94A3B8]">{label}</p><div className="text-sm font-semibold text-white">{value}</div></div>);
}

function RepairCard({ repair }: { repair: Repair }) {
  return (
    <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-white">{repair.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{repair.mechanic}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{repair.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{repair.laborHours} ساعت</span>
          </div>
          {repair.partsUsed?.length > 0 && (<div className="mt-2 flex flex-wrap gap-1">{repair.partsUsed.map((part, i) => (<span key={i} className="flex items-center gap-1 rounded-full bg-[#1E293B] px-2.5 py-0.5 text-xs text-[#94A3B8]"><Package className="h-3 w-3" />{part}</span>))}</div>)}
        </div>
        <div className="flex-shrink-0 text-left">
          <p className="text-sm font-bold text-[#3B82F6] flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{repair.cost.toLocaleString('fa-IR')}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${repair.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : repair.status === 'in-progress' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-amber-500/10 text-amber-400'}`}>{repair.status === 'completed' ? 'تکمیل' : repair.status === 'in-progress' ? 'در حال انجام' : 'در انتظار'}</span>
        </div>
      </div>
    </div>
  );
}
