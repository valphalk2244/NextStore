'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, Upload, Loader2, ShoppingBag, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, addItem, decreaseItem, totalPrice, clearCart, setUserId } = useCartStore();
  const [uploading, setUploading] = useState(false);
  const [slipUrl, setSlipUrl] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  // 🔐 ตรวจสอบ User และตั้งค่า ID ใน Store เพื่อป้องกันสินค้าค้างจาก ID อื่น
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
      } else {
        setUserId(null);
        setUserEmail(null);
      }
    };
    checkUser();
  }, [setUserId]);

  const handleUploadSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setSlipUrl(data.secure_url);
        toast.success("อัปโหลดสลิปเรียบร้อย");
      }
    } catch (err) {
      toast.error("อัปโหลดล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("ตะกร้าว่างเปล่า");
    if (!slipUrl) return toast.error("กรุณาแนบสลิปโอนเงิน");

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('orders').insert([
        {
          customer_name: customerInfo.name,
          customer_email: userEmail, // 🚩 ส่ง Email ไปด้วยเพื่อใช้ดึงประวัติภายหลัง
          address: customerInfo.address,
          phone: customerInfo.phone,
          items: items,
          total_price: totalPrice(),
          slip_url: slipUrl,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      toast.success("สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ");
      clearCart();
      router.push('/history'); // ส่งไปหน้าประวัติการซื้อ
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <ShoppingBag size={80} className="text-gray-100 mb-6" />
        <h2 className="text-2xl font-black text-gray-300">ตะกร้าว่างเปล่า</h2>
        <button onClick={() => router.push('/')} className="mt-6 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all">
          ไปช้อปปิ้งเลย
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl font-sans">
      <h1 className="text-4xl font-black mb-10 flex items-center gap-3">
        <ShoppingBag className="text-blue-600" /> ตะกร้าของฉัน
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* รายการสินค้า */}
        <div className="lg:col-span-7 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-6 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-[1.5rem]" />
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                <p className="text-blue-600 font-black text-xl mb-3">฿{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border">
                    <button onClick={() => decreaseItem(item.id)} className="p-2 hover:bg-white rounded-lg transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <button onClick={() => addItem(item)} className="p-2 hover:bg-white rounded-lg transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-4 text-red-200 hover:text-red-500 transition-colors">
                <Trash2 size={24} />
              </button>
            </div>
          ))}
        </div>

        {/* ฟอร์มการชำระเงิน */}
        <div className="lg:col-span-5">
          <div className="bg-gray-900 text-white p-8 rounded-[3rem] shadow-2xl sticky top-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <CreditCard /> สรุปยอดและชำระเงิน
            </h2>
            
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="ชื่อผู้รับ" required 
                  className="w-full p-4 bg-gray-800 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all border-none"
                  value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
                <input 
                  type="text" placeholder="เบอร์โทรศัพท์" required 
                  className="w-full p-4 bg-gray-800 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all border-none"
                  value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
                <textarea 
                  placeholder="ที่อยู่ในการจัดส่ง" required 
                  className="w-full p-4 bg-gray-800 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all border-none h-28"
                  value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                />
              </div>

              <div className="py-6 border-y border-gray-800">
                <div className="flex justify-between items-center mb-2 text-gray-400">
                  <span>ราคาสินค้า</span>
                  <span>฿{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-black">
                  <span>ยอดชำระทั้งสิ้น</span>
                  <span className="text-blue-400">฿{totalPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">หลักฐานโอนเงิน</p>
                <div className="h-48 border-2 border-dashed border-gray-700 rounded-[2rem] bg-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                  {slipUrl ? (
                    <div className="relative w-full h-full group">
                      <img src={slipUrl} className="w-full h-full object-cover" alt="Slip" />
                      <button type="button" onClick={() => setSlipUrl('')} className="absolute top-3 right-3 bg-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer p-10 w-full">
                      {uploading ? <Loader2 className="animate-spin text-blue-400" /> : <Upload className="text-gray-500" />}
                      <span className="text-sm font-bold text-gray-500 mt-2">อัปโหลดสลิป</span>
                      <input type="file" className="hidden" onChange={handleUploadSlip} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              <button 
                disabled={isSubmitting || uploading}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:bg-gray-700 mt-4"
              >
                {isSubmitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันและชำระเงิน'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}