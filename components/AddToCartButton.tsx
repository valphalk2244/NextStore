// components/AddToCartButton.tsx
'use client';

import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // โยนข้อมูลสินค้าเข้า Zustand Store
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });
    toast.success('เพิ่มสินค้าลงตะกร้าแล้ว! 🛒'); // ถ้ามีเวลาค่อยเปลี่ยนเป็น Toast สวยๆ ทีหลังได้
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full bg-black text-white py-4 rounded-md text-lg font-semibold hover:bg-gray-800 transition"
    >
      เพิ่มลงตะกร้า (Add to Cart)
    </button>
  );
}