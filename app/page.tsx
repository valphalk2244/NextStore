'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ShoppingCart, Search, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('โหลดข้อมูลสินค้าไม่สำเร็จ');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  // กรองสินค้าตามการค้นหา
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <main className="font-sans">
      {/* 1. Hero Section */}
      <section className="bg-gray-900 text-white py-16 px-4 mb-12">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            UP TO <span className="text-blue-500">50% OFF</span>
          </h1>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            คอลเลกชันใหม่ล่าสุดปี 2026 พร้อมให้คุณเป็นเจ้าของแล้ววันนี้ ส่งฟรีทั่วไทยเมื่อช้อปครบ 999.-
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="ค้นหาสินค้าที่ต้องการ..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. Product Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black">สินค้าทั้งหมด</h2>
            <p className="text-gray-500 text-sm">พบสินค้า {filteredProducts.length} รายการ</p>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col h-full">
                {/* Image Container */}
                <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 mb-4 shadow-sm">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    NEW
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-grow">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2 h-8">
                    {product.description || 'คุณภาพระดับพรีเมียม'}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-black">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => {
                        addItem(product);
                        toast.success('เพิ่มลงตะกร้าแล้ว 🛒');
                      }}
                      className="bg-gray-100 p-2.5 rounded-xl hover:bg-black hover:text-white transition-all active:scale-90"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <p className="text-gray-400 italic">ไม่พบสินค้าที่คุณกำลังมองหา...</p>
            <button onClick={() => setSearchTerm('')} className="text-blue-600 underline mt-2 text-sm">ล้างการค้นหา</button>
          </div>
        )}
      </div>

      {/* 3. Footer Banner */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-blue-600 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200">
          <div>
            <h2 className="text-3xl font-black mb-2">สมัครสมาชิกวันนี้!</h2>
            <p className="opacity-80">รับสิทธิพิเศษและส่วนลดสำหรับการสั่งซื้อครั้งแรกทันที</p>
          </div>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-lg">
            สมัครสมาชิก <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}