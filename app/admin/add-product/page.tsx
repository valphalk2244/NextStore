'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Package, 
  Upload, 
  Loader2, 
  Box, 
  Image as ImageIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    image_url: '', 
    description: '' 
  });
  const router = useRouter();

  // 🚩 แก้ไขอีเมลแอดมินของคุณที่นี่
  const ADMIN_EMAIL = "admin@nextshop.com"; 

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      router.push('/');
      return;
    }
    fetchProducts();
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  // ☁️ 1. ฟังก์ชันอัปโหลดรูปไป Cloudinary (แก้ปัญหาเรื่องกรอก URL เอง)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      );
      const fileData = await res.json();
      
      if (fileData.secure_url) {
        setFormData({ ...formData, image_url: fileData.secure_url });
        toast.success("อัปโหลดรูปภาพสำเร็จ!");
      } else {
        toast.error("อัปโหลดล้มเหลว ตรวจสอบความถูกต้องของ Preset");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  // 💾 2. ฟังก์ชันบันทึกสินค้าลง Supabase (แก้ Runtime ReferenceError)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return toast.error("กรุณาอัปโหลดรูปภาพก่อนบันทึก");

    const { error } = await supabase.from('products').insert([
      { 
        name: formData.name, 
        price: Number(formData.price), 
        image_url: formData.image_url, 
        description: formData.description 
      }
    ]);

    if (error) {
      toast.error("เพิ่มสินค้าไม่สำเร็จ");
    } else {
      toast.success("เพิ่มสินค้าลงร้านเรียบร้อย!");
      setFormData({ name: '', price: '', image_url: '', description: '' });
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      toast.success("ลบสินค้าเรียบร้อย");
      fetchProducts();
    }
  };

  if (loading) return <div className="p-20 text-center font-sans">กำลังตรวจสอบข้อมูล...</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl font-sans text-gray-900">
      
      {/* --- ส่วน Tabs Menu (ทำให้ปุ่มสลับไม่หาย) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Box className="text-blue-600" /> จัดการสต็อกสินค้า
          </h1>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <Link href="/admin" className="px-6 py-2 text-gray-500 hover:text-black font-bold text-sm transition">
            ออเดอร์
          </Link>
          <button className="px-6 py-2 bg-white shadow-sm rounded-xl font-bold text-sm">
            สินค้า
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- ฝั่งซ้าย: ฟอร์มเพิ่มสินค้า --- */}
        <section className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-500" /> ลงสินค้าใหม่
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ชื่อสินค้า</label>
                <input 
                  type="text" required className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ราคาสินค้า (บาท)</label>
                <input 
                  type="number" required className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              
              {/* Image Upload Area */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">รูปภาพ</label>
                <div className="mt-1 h-44 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group transition hover:border-blue-400">
                  {formData.image_url ? (
                    <>
                      <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                         <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="bg-white text-red-500 p-2 rounded-full font-bold text-xs">เปลี่ยนรูป</button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer p-4 w-full h-full justify-center">
                      {uploading ? <Loader2 className="animate-spin text-blue-500" /> : <Upload className="text-gray-300" />}
                      <span className="text-[10px] font-bold text-gray-400 mt-2">{uploading ? 'กำลังส่งข้อมูล...' : 'อัปโหลดรูปภาพสินค้า'}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">รายละเอียด</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 h-24 transition"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button disabled={uploading} className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition shadow-lg disabled:bg-gray-300">
                {uploading ? 'รออัปโหลดรูป...' : 'บันทึกข้อมูลสินค้า'}
              </button>
            </form>
          </div>
        </section>

        {/* --- ฝั่งขวา: รายการสินค้าที่มีอยู่ --- */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold flex items-center gap-2">
                <Package size={20} className="text-gray-400" /> รายการทั้งหมด ({products.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <img src={product.image_url} className="w-16 h-16 rounded-xl object-cover border border-gray-100" alt="" />
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">{product.name}</h3>
                      <p className="text-blue-600 font-black text-sm">฿{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                  <ImageIcon size={40} className="mb-2 opacity-10" />
                  ยังไม่มีสินค้าในสต็อก
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}