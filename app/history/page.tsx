'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PurchaseHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyHistory = async () => {
      // 1. ดึงข้อมูล User ที่ Login อยู่
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 2. ดึง Order ที่ตรงกับ Email ของ User นี้
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', session.user.email) // 🚩 ต้องมี Column customer_email ในตาราง orders
          .order('created_at', { ascending: false });

        if (!error) setOrders(data || []);
      }
      setLoading(false);
    };

    fetchMyHistory();
  }, []);

  if (loading) return <div className="p-20 text-center font-sans">กำลังดึงประวัติการซื้อ...</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl font-sans">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <Package className="text-blue-600" /> ประวัติการสั่งซื้อ
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed text-gray-400">
          คุณยังไม่เคยสั่งซื้อสินค้า
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-mono">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {order.status === 'completed' ? 'สำเร็จ' : 'รอตรวจสอบ'}
                </span>
              </div>

              <div className="space-y-2">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center">
                <span className="text-sm font-bold">ยอดรวมสุทธิ</span>
                <span className="text-lg font-black text-blue-600">฿{order.total_price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}