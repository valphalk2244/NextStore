// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCartStore, CartItem } from '@/store/cartStore';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slipUrl, setSlipUrl] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const router = useRouter();

  // ป้องกัน Hydration Error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // คำนวณราคารวมสดๆ เพื่อความแม่นยำและลด Error เรื่อง Type
  const totalAmount = items.reduce((total: number, item: CartItem) => 
    total + (item.price * item.quantity), 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('ไม่มีสินค้าในตะกร้า');
      return;
    }

    if (!slipUrl) {
      toast.error('กรุณาอัปโหลดสลิปเพื่อยืนยันการชำระเงิน');
      return;
    }

    setLoading(true);

    try {
      // บันทึกข้อมูลลงตาราง orders ใน Supabase
      const { error } = await supabase.from('orders').insert([
        {
          customer_name: customer.name,
          phone: customer.phone,
          address: customer.address,
          total_price: totalAmount,
          items: items, // เก็บเป็น JSONB ใน Database
          slip_url: slipUrl,
          status: 'pending' // สถานะเริ่มต้นคือรอตรวจสอบ
        }
      ]);

      if (error) throw error;

      toast.success('สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ');
      clearCart(); // ล้างตะกร้าหลังจากสั่งซื้อสำเร็จ
      router.push('/checkout/success'); // ไปหน้าขอบคุณ

    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">ที่อยู่จัดส่งและชำระเงิน</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ฝั่งกรอกข้อมูล */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">1. ข้อมูลติดต่อ</h2>
          <input
            type="text"
            placeholder="ชื่อ-นามสกุล"
            required
            className="input-field"
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            required
            className="input-field"
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
          <textarea
            placeholder="ที่อยู่สำหรับการจัดส่งโดยละเอียด"
            required
            className="input-field h-32 resize-none"
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          />
          
          <div className="pt-4">
            <button
              disabled={loading || !slipUrl}
              className="btn-primary w-full py-4 text-lg shadow-lg"
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการสั่งซื้อ'}
            </button>
          </div>
        </form>

        {/* ฝั่งสรุปยอดและโอนเงิน */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">2. ชำระเงิน</h2>
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>จำนวนสินค้า</span>
              <span>{items.length} รายการ</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>ยอดโอนสุทธิ</span>
              <span className="text-red-600">฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-sm text-gray-500 mb-2">สแกนเพื่อโอนเงิน (PromptPay)</p>
            {/* คุณสามารถใส่รูป QR Code ของคุณที่นี่ */}
            <div className="bg-gray-200 w-40 h-40 mx-auto mb-4 flex items-center justify-center rounded">
               <span className="text-xs text-gray-400 text-center px-2">รูป QR Code <br/> พร้อมเพย์ของคุณ</span>
            </div>

            {slipUrl ? (
              <div className="relative inline-block">
                <img src={slipUrl} alt="slip" className="h-56 rounded-lg shadow-md" />
                <button 
                  type="button"
                  onClick={() => setSlipUrl('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(res: any) => setSlipUrl(res.info.secure_url)}
              >
                {({ open }) => (
                  <button 
                    type="button" 
                    onClick={() => open()}
                    className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-xl font-medium hover:bg-blue-100 transition"
                  >
                    📸 อัปโหลดสลิปโอนเงิน
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}