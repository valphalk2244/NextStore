// app/cart/page.tsx
'use client';

import { CartItem, useCartStore } from '../../store/cartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  // แก้ปัญหา Hydration mismatch ใน Next.js เมื่อใช้ localStorage
  const [isMounted, setIsMounted] = useState(false);
  const { items, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // คำนวณราคารวม
  const totalPrice = items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; กลับไปเลือกซื้อสินค้าต่อ
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้าของคุณ</h1>

      {items.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">ยังไม่มีสินค้าในตะกร้า</p>
          <Link href="/" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
            ไปช้อปปิ้งกันเลย
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-500 text-sm">฿{item.price} x {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold">฿{item.price * item.quantity}</p>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-end">
            <p className="text-xl mb-4">
              ยอดรวมทั้งหมด: <span className="font-bold text-2xl text-blue-600">฿{totalPrice}</span>
            </p>
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={clearCart}
                className="px-6 py-3 border rounded-md hover:bg-gray-50 transition w-full sm:w-auto"
              >
                ล้างตะกร้า
              </button>
              <Link 
  href="/checkout" 
  className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition text-center w-full sm:w-auto"
>
  สั่งซื้อสินค้า (Checkout)
</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}