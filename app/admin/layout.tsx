// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // ตรวจสอบว่ามีข้อมูลการล็อกอิน (Session) อยู่ในระบบไหม
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // ถ้าไม่มี (ยังไม่ล็อกอิน) ให้เตะไปหน้า Login
        router.replace('/login');
      } else {
        // ถ้ามี (ล็อกอินแล้ว) ให้อนุญาตให้ดูหน้า Admin ได้
        setIsAuthorized(true);
      }
    };

    checkUser();
  }, [router]);

  // ระหว่างรอเช็คสถานะ ให้โชว์หน้าโหลดไปก่อน (ป้องกันหน้า Admin แวบขึ้นมา)
  if (!isAuthorized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-3 text-gray-600">กำลังตรวจสอบสิทธิ์...</span>
      </div>
    );
  }

  // ถ้าเช็คผ่านแล้ว ก็แสดงเนื้อหาหน้า Admin ตามปกติ
  return <>{children}</>;
}