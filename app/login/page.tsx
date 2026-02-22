'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } else {
      toast.success('ยินดีต้อนรับ!');
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6">เข้าสู่ระบบ</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="อีเมล" required className="input-field" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="รหัสผ่าน" required className="input-field" onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">ยังไม่มีบัญชี? <Link href="/register" className="text-black font-bold">สมัครสมาชิก</Link></p>
      </div>
    </div>
  );
}