'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti'; // ถ้าอยากให้มีพลุฉลอง (npm install canvas-confetti)

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // ยิงพลุฉลองเบาๆ
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans px-4">
      <div className="bg-green-50 p-6 rounded-full mb-6">
        <CheckCircle2 size={80} className="text-green-500" />
      </div>
      
      <h1 className="text-4xl font-black text-gray-900 mb-2">สั่งซื้อสำเร็จ!</h1>
      <p className="text-gray-500 text-center max-w-sm mb-10">
        ได้รับข้อมูลออเดอร์ของคุณเรียบร้อยแล้ว <br /> 
        แอดมินจะตรวจสอบสลิปและรีบจัดส่งให้เร็วที่สุดครับ
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link 
          href="/" 
          className="flex-1 bg-black text-white text-center py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
        >
          <ShoppingBag size={18} /> กลับไปช้อปต่อ
        </Link>
        <Link 
          href="/orders" 
          className="flex-1 bg-white border border-gray-200 text-center py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          ดูประวัติสั่งซื้อ <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}