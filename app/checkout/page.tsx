// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // State สำหรับเก็บข้อมูลลูกค้า
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  // คำนวณยอดรวม
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // ถ้าไม่มีของในตะกร้า ไม่ให้เข้าหน้านี้
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">ไม่มีสินค้าให้สั่งซื้อ</h1>
        <Link href="/" className="text-blue-600 hover:underline">กลับไปหน้าแรก</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // บันทึกข้อมูลลง Supabase
    const { error } = await supabase.from('orders').insert([
      {
        customer_name: customer.name,
        phone: customer.phone,
        address: customer.address,
        total_price: totalPrice,
        items: items, // โยน array ของในตะกร้าลง JSONB ได้เลย
      }
    ]);

    setLoading(false);

    if (error) {
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + error.message);
    } else {
      alert('🎉 สั่งซื้อสำเร็จ! ขอบคุณที่อุดหนุนครับ');
      clearCart(); // ล้างตะกร้า
      router.push('/'); // กลับหน้าแรก
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/cart" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; กลับไปหน้าตะกร้า
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">ยืนยันการสั่งซื้อ</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        
        <div>
          <label className="block text-sm font-medium mb-2">ชื่อ-นามสกุล</label>
          <input 
            type="text" required 
            value={customer.name}
            onChange={(e) => setCustomer({...customer, name: e.target.value})}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
          <input 
            type="tel" required 
            value={customer.phone}
            onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ที่อยู่จัดส่ง</label>
          <textarea 
            required rows={3}
            value={customer.address}
            onChange={(e) => setCustomer({...customer, address: e.target.value})}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div className="border-t pt-4 mt-6">
          <p className="text-lg flex justify-between font-bold">
            <span>ยอดชำระเงินทั้งหมด:</span>
            <span className="text-blue-600">฿{totalPrice}</span>
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {loading ? 'กำลังประมวลผล...' : 'ยืนยันการสั่งซื้อ'}
        </button>

      </form>
    </main>
  );
}