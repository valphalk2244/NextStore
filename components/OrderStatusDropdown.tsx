'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

export default function OrderStatusDropdown({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('อัปเดตไม่สำเร็จ');
    } else {
      setStatus(newStatus);
      toast.success('อัปเดตสถานะแล้ว: ' + newStatus);
    }
    setLoading(false);
  };

  return (
    <select 
      value={status} 
      disabled={loading}
      onChange={(e) => updateStatus(e.target.value)}
      className={`text-xs p-1 rounded border font-medium ${
        status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
        status === 'paid' ? 'bg-green-100 text-green-700' :
        status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
      }`}
    >
      <option value="pending">⏳ รอตรวจสอบ</option>
      <option value="paid">✅ รับยอดเงินแล้ว</option>
      <option value="shipped">🚚 ส่งของแล้ว</option>
      <option value="cancelled">❌ ยกเลิก</option>
    </select>
  );
}