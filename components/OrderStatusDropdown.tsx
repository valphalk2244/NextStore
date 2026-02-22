// components/OrderStatusDropdown.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OrderStatusDropdown({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string, 
  currentStatus: string 
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);

    // อัปเดตข้อมูลในตาราง orders ของ Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    setIsLoading(false);

    if (error) {
      toast.error('อัปเดตสถานะไม่สำเร็จ: ' + error.message);
    } else {
      toast.success('อัปเดตสถานะเรียบร้อยแล้ว! 📦');
      router.refresh(); // สั่งให้ Next.js ดึงข้อมูลใหม่มาแสดงทันที
    }
  };

  return (
    <select
      value={status}
      onChange={handleStatusChange}
      disabled={isLoading}
      className={`px-3 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer border transition-colors ${
        status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
        status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
        'bg-green-100 text-green-800 border-green-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="pending">รอตรวจสอบ</option>
      <option value="shipped">จัดส่งแล้ว</option>
      <option value="completed">เสร็จสิ้น</option>
    </select>
  );
}