'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { items } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // 🚩 แก้ไข: ใส่ Email แอดมินของคุณที่นี่
  const ADMIN_EMAIL = "admin@nextshop.com"; 

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('ออกจากระบบแล้ว');
    router.push('/');
    router.refresh();
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tighter">🛒 MYSHOP</Link>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          <div>
            <Link href="/history" className="p-2 hover:bg-gray-100 rounded-full transition">
              
              <span className="text-gray-400 hover:text-green-500 transition p-2">ประวัติการสั่งซื้อ</span>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-1 text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                  <LayoutDashboard size={16} />
                  <span>จัดการร้าน</span>
                </Link>
              )}
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition p-2">
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium hover:text-blue-600">เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-black text-white text-sm px-4 py-2 rounded-full hover:bg-gray-800 transition">สมัครสมาชิก</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}