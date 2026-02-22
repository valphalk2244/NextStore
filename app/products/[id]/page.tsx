'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useCartStore } from '@/store/cartStore';
import ReviewSection from '@/components/ReviewSection';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-sans">กำลังโหลดข้อมูลสินค้า...</div>;
  if (!product) return <div className="p-20 text-center font-sans">ไม่พบสินค้านี้</div>;

  return (
    <main className="container mx-auto px-4 py-10 font-sans">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition">
        <ArrowLeft size={20} /> กลับหน้าแรก
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* รูปสินค้า */}
        <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-inner">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover hover:scale-105 transition duration-500"
          />
        </div>

        {/* ข้อมูลสินค้า */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black mb-4 tracking-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">฿{product.price.toLocaleString()}</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="text-green-500" size={18} /> รับประกันคุณภาพ
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Truck className="text-blue-500" size={18} /> ส่งด่วนใน 1-3 วัน
            </div>
          </div>

          <button 
            onClick={() => {
              addItem(product);
              toast.success('เพิ่มลงตะกร้าแล้ว');
            }}
            className="flex items-center justify-center gap-3 w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition shadow-lg active:scale-95"
          >
            <ShoppingCart size={24} /> เพิ่มลงตะกร้าสินค้า
          </button>
        </div>
      </div>

      {/* ระบบรีวิว (เรียกใช้ Component ที่เราสร้างคราวก่อน) */}
      <ReviewSection productId={product.id} />
    </main>
  );
}