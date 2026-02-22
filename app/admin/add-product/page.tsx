// app/admin/add-product/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันบันทึกข้อมูลลง Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
        }
      ]);

    setLoading(false);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('เพิ่มสินค้าสำเร็จ!');
      router.push('/'); // กลับไปหน้าแรก
      router.refresh(); // รีเฟรชข้อมูลใหม่
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; กลับไปหน้าแรก
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">เพิ่มสินค้าใหม่</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        
        {/* ชื่อสินค้า */}
        <div>
          <label className="block text-sm font-medium mb-2">ชื่อสินค้า</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none" 
            placeholder="เช่น เสื้อยืดลายแมว"
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-sm font-medium mb-2">รายละเอียดสินค้า</label>
          <textarea 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none"
            placeholder="อธิบายสินค้าของคุณ..."
          />
        </div>

        {/* ราคา */}
        <div>
          <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
          <input 
            type="number" 
            required 
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none" 
            placeholder="299"
          />
        </div>

        {/* อัปโหลดรูปภาพด้วย Cloudinary */}
        <div>
          <label className="block text-sm font-medium mb-2">รูปภาพสินค้า</label>
          
          <CldUploadWidget 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: any) => {
              // ดึง URL ของรูปที่อัปโหลดเสร็จแล้วมาเก็บใน State
              setImageUrl(result.info.secure_url);
            }}
          >
            {({ open }) => {
              return (
                <div className="border-2 border-dashed rounded-md p-4 text-center">
                  {imageUrl ? (
                    <div className="space-y-4">
                      <img src={imageUrl} alt="Preview" className="h-40 mx-auto object-contain" />
                      <button type="button" onClick={() => open()} className="text-sm text-blue-600 hover:underline">
                        เปลี่ยนรูปภาพ
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => open()} className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition">
                      + อัปโหลดรูปภาพ
                    </button>
                  )}
                </div>
              );
            }}
          </CldUploadWidget>
        </div>

        {/* ปุ่ม Submit */}
        <button 
          type="submit" 
          disabled={loading || !imageUrl}
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
        </button>

      </form>
    </main>
  );
}