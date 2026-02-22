// app/page.tsx
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

// ฟังก์ชันดึงข้อมูลสินค้าทั้งหมดจาก Supabase
async function getProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return products;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">สินค้าทั้งหมดของเรา</h1>
      
      {/* Grid สำหรับแสดงสินค้าแบบ Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            href={`/products/${product.id}`} 
            key={product.id} 
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition block group bg-white"
          >
            
            {/* โชว์รูปภาพ (มี effect ซูมรูปนิดๆ ตอนเอาเมาส์ชี้ด้วย Tailwind group-hover) */}
            <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden relative">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* รายละเอียดสินค้า */}
            <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
            <p className="text-xl font-bold text-blue-600">฿{product.price}</p>
            
            <div className="w-full mt-4 bg-black text-white text-center py-2 rounded-md group-hover:bg-gray-800 transition">
              ดูรายละเอียด
            </div>
            
          </Link>
        ))}
      </div>

      {/* ถ้าไม่มีสินค้าเลยให้โชว์ข้อความนี้ */}
      {products.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          ยังไม่มีสินค้าในระบบ ลองเพิ่มข้อมูลใน Supabase ดูนะ
        </div>
      )}
    </main>
  );
}