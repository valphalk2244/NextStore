'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMyOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', session.user.email) // สมมติว่าคุณเก็บเมลลูกค้าใน table orders ด้วย
        .order('created_at', { ascending: false });
      
      setOrders(data || []);
    };
    fetchMyOrders();
  }, []);

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">ประวัติการสั่งซื้อ</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">วันที่: {new Date(order.created_at).toLocaleDateString()}</p>
              <p className="font-bold">฿{order.total_price.toLocaleString()}</p>
            </div>
            <div className={`px-4 py-1 rounded-full text-sm font-bold ${
              order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {order.status === 'completed' ? 'ส่งแล้ว' : 'รอดำเนินการ'}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}