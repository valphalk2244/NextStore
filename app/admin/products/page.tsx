'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, Loader2, Box, Image as ImageIcon, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', image_url: '', description: '' });
  const router = useRouter();

  // 🛡️ ตรวจสอบสิทธิ์แอดมินก่อนโหลดข้อมูล
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const ADMIN_EMAIL = "admin@nextshop.com";

      if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/');
        return;
      }
      fetchProducts();
    };
    checkAdmin();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) toast.error("โหลดข้อมูลสินค้าไม่สำเร็จ");
    else setProducts(data || []);
    setLoading(false);
  };

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
      }
    } catch (err) {
      toast.error("อัปโหลดรูปภาพล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return toast.error("กรุณาอัปโหลดรูปภาพสินค้า");

    const { error } = await supabase.from('products').insert([
      { 
        name: formData.name, 
        price: Number(formData.price), 
        image_url: formData.image_url, 
        description: formData.description 
      }
    ]);

    if (error) {
      toast.error("เพิ่มสินค้าไม่สำเร็จ: " + error.message);
    } else {
      toast.success("เพิ่มสินค้าใหม่แล้ว!");
      setFormData({ name: '', price: '', image_url: '', description: '' });
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error("ลบสินค้าไม่สำเร็จ");
    else {
      toast.success("ลบสินค้าเรียบร้อย");
      fetchProducts();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="ml-3 font-bold text-gray-500">กำลังจัดการคลังสินค้า...</span>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl font-sans text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-4xl font-black flex items-center gap-3">
          <Box className="text-blue-600" /> จัดการสินค้า
        </h1>
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] border border-gray-200 shadow-inner">
          <Link href="/admin" className="px-8 py-2.5 text-gray-500 font-bold hover:text-black transition-all">ออเดอร์</Link>
          <button className="px-8 py-2.5 bg-white shadow-md rounded-2xl font-black text-blue-600">สินค้า</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ฟอร์มเพิ่มสินค้า */}
        <div className="lg:col-span-4">
          <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-5 sticky top-8">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Plus size={20} className="text-green-500" /> เพิ่มสินค้าใหม่
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" placeholder="ชื่อสินค้า" required 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all border-none"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="relative">
                <input 
                  type="number" placeholder="ราคา (บาท)" required 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all border-none"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <textarea 
                placeholder="รายละเอียดสินค้า" 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all border-none h-28"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />

              <div className="h-48 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group">
                {formData.image_url ? (
                  <div className="relative w-full h-full">
                    <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                    <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer p-6">
                    {uploading ? <Loader2 className="animate-spin text-blue-500" /> : <ImageIcon className="text-gray-300" size={32} />}
                    <span className="text-sm font-bold text-gray-400 mt-2">คลิกเพื่ออัปโหลดรูป</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <button 
              disabled={uploading}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-300"
            >
              {uploading ? 'กำลังอัปโหลด...' : 'เพิ่มลงคลังสินค้า'}
            </button>
          </form>
        </div>

        {/* รายการสินค้า */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          {products.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-bold italic">
              ไม่มีสินค้าในคลัง
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover shadow-sm border" alt={p.name} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800">{p.name}</h3>
                    <p className="text-blue-600 font-black flex items-center gap-1">
                      <DollarSign size={14} /> {p.price.toLocaleString()} บาท
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="p-4 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}