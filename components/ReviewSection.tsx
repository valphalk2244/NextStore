// components/ReviewSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchReviews();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user));
  }, [productId]);

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast.error('กรุณาเข้าสู่ระบบก่อนรีวิวครับ');

    const { error } = await supabase.from('reviews').insert([
      { product_id: productId, user_email: user.email, rating, comment }
    ]);

    if (error) toast.error('ส่งรีวิวไม่สำเร็จ');
    else {
      toast.success('ขอบคุณสำหรับรีวิวครับ!');
      setComment('');
      fetchReviews();
    }
  }

  return (
    <div className="mt-12 border-t pt-10 font-sans">
      <h2 className="text-2xl font-bold mb-6">รีวิวจากลูกค้า ({reviews.length})</h2>

      {/* ฟอร์มเขียนรีวิว */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-2xl">
          <p className="font-bold mb-3">ให้คะแนนสินค้านี้</p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num} type="button"
                onClick={() => setRating(num)}
                className={rating >= num ? 'text-yellow-400' : 'text-gray-300'}
              >
                <Star fill={rating >= num ? 'currentColor' : 'none'} size={24} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-black mb-3 h-24"
            placeholder="สินค้าชิ้นนี้เป็นอย่างไรบ้าง?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">ส่งรีวิว</button>
        </form>
      ) : (
        <p className="text-gray-500 mb-8 p-4 bg-gray-50 rounded-xl">ล็อกอินเพื่อเขียนรีวิวสินค้า</p>
      )}

      {/* รายการรีวิว */}
      <div className="space-y-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-yellow-400">
                {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-sm font-bold">{rev.user_email.split('@')[0]}</span>
            </div>
            <p className="text-gray-600">{rev.comment}</p>
            <p className="text-[10px] text-gray-400 mt-2">{new Date(rev.created_at).toLocaleDateString('th-TH')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}