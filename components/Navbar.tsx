// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  // แก้ปัญหา Hydration ของ Next.js
  useEffect(() => setIsMounted(true), []);

  // นับจำนวนชิ้นทั้งหมดในตะกร้า
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* โลโก้ซ้ายสุด กดแล้วกลับหน้าแรก */}
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          🛒 MyShop
        </Link>
        
        <div className="flex items-center gap-6">
          
          {/* เมนูแอดมิน: เพิ่มสินค้า */}
          <Link href="/admin/add-product" className="text-sm text-gray-500 hover:text-black transition">
            + เพิ่มสินค้า
          </Link>

          {/* เมนูแอดมิน: ดูออเดอร์ (เพิ่งเพิ่มใหม่) */}
          <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-black transition">
            📦 ดูออเดอร์
          </Link>

          {/* ไอคอนตะกร้าสินค้า */}
          <Link href="/cart" className="relative ml-2 text-gray-800 hover:text-black transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            
            {/* Badge สีแดงโชว์จำนวนของในตะกร้า (โชว์เมื่อโหลดฝั่ง Client เสร็จและมีของ > 0) */}
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
        </div>
      </div>
    </nav>
  );
}