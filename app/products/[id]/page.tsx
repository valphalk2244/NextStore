// app/products/[id]/page.tsx
import { supabase } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

// ฟังก์ชันดึงข้อมูลสินค้า 1 ชิ้นจาก Supabase ตาม ID
async function getProduct(id: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return product;
}

export default async function ProductDetail({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  
  // เรียกใช้ฟังก์ชัน getProduct (แก้ชื่อให้ตรงกัน)
  const product = await getProduct(resolvedParams.id);

  // ถ้าไม่เจอสินค้า ให้โยนไปหน้า 404
  if (!product) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; กลับไปหน้าแรก
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ฝั่งซ้าย: รูปภาพสินค้า */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>

        {/* ฝั่งขวา: รายละเอียดสินค้า */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-6">฿{product.price}</p>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">รายละเอียดสินค้า:</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>

          {/* 🟢 เรียกใช้ Component ปุ่มเพิ่มลงตะกร้า พร้อมส่งข้อมูล product ไปให้ */}
          <AddToCartButton product={product} />

        </div>
      </div>
    </main>
  );
}