'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  ClipboardList, 
  Package, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock,
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId);

    if (!error) fetchOrders();
  };

  if (loading) return <div className="p-20 text-center font-sans">กำลังโหลดประวัติการสั่งซื้อ...</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl font-sans text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> ประวัติการสั่งซื้อ
        </h1>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button className="px-6 py-2 bg-white shadow-sm rounded-xl font-bold text-sm">
            ออเดอร์
          </button>
          <Link href="/admin/products" className="px-6 py-2 text-gray-500 hover:text-black font-bold text-sm">
            สินค้า
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[3rem] border border-dashed text-gray-400">
          ยังไม่มีข้อมูลการสั่งซื้อเข้ามาในขณะนี้
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              {/* ส่วนที่ 1: ข้อมูลลูกค้าและสถานะ */}
              <div className="p-8 md:w-1/3 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-4">
                  {order.status === 'completed' ? (
                    <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                      <CheckCircle2 size={12} /> สำเร็จ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">
                      <Clock size={12} /> รอตรวจสอบ
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 font-mono">#{order.id.slice(0, 8)}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="font-bold">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    {order.phone}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                    {order.address}
                  </div>
                </div>

                <button 
                  onClick={() => updateStatus(order.id, order.status)}
                  className="mt-6 w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-black hover:text-white transition-colors shadow-sm"
                >
                  เปลี่ยนสถานะออเดอร์
                </button>
              </div>

              {/* ส่วนที่ 2: รายการสินค้า */}
              <div className="p-8 md:w-1/3 border-x border-gray-50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package size={14} /> รายการสินค้า
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold">
                          x{item.quantity}
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-dashed flex justify-between items-center">
                  <span className="font-bold">ราคารวม</span>
                  <span className="text-xl font-black italic">฿{order.total_price.toLocaleString()}</span>
                </div>
              </div>

              {/* ส่วนที่ 3: หลักฐานการโอน */}
              <div className="p-8 md:w-1/3 flex flex-col items-center justify-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">หลักฐานการโอน</h3>
                {order.slip_url ? (
                  <div className="relative group">
                    <img 
                      src={order.slip_url} 
                      className="w-32 h-44 object-cover rounded-2xl shadow-lg border-2 border-white transform group-hover:scale-105 transition-transform" 
                      alt="Payment Slip" 
                    />
                    <a 
                      href={order.slip_url} 
                      target="_blank" 
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity text-white text-[10px] font-bold"
                    >
                      <ExternalLink size={14} className="mr-1" /> ดูรูปเต็ม
                    </a>
                  </div>
                ) : (
                  <div className="w-32 h-44 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 italic text-[10px]">
                    ไม่มีหลักฐาน
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}