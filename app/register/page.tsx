'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // เพิ่มช่องยืนยันรหัส
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // เช็คว่ารหัสตรงกันไหม
    if (password !== confirmPassword) {
      return toast.error('รหัสผ่านไม่ตรงกันครับ');
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        // ให้ส่งไปหน้า login หลังจากกดยืนยันเมล (ถ้ามีระบบยืนยัน)
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('สมัครสมาชิกสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยัน');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">สร้างบัญชีใหม่</h1>
          <p className="text-gray-500 mt-2">เข้าร่วมกับ MyShop วันนี้</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">อีเมล</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">รหัสผ่าน</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">ยืนยันรหัสผ่าน</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition"
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition shadow-lg active:scale-95 disabled:bg-gray-400 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                กำลังประมวลผล...
              </span>
            ) : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="text-black font-bold hover:underline underline-offset-4">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}