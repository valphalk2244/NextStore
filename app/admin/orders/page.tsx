// app/admin/orders/page.tsx
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import OrderStatusDropdown from '@/components/OrderStatusDropdown';

// ฟังก์ชันดึงข้อมูลออเดอร์ทั้งหมด จัดเรียงจากใหม่ไปเก่า
async function getOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return orders;
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📦 จัดการคำสั่งซื้อ (Orders)</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; กลับหน้าแรก
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">วันที่สั่งซื้อ</th>
              <th className="p-4 font-semibold text-gray-600">ข้อมูลลูกค้า</th>
              <th className="p-4 font-semibold text-gray-600">ยอดรวม</th>
              <th className="p-4 font-semibold text-gray-600">สถานะ</th>
              <th className="p-4 font-semibold text-gray-600">สินค้าที่สั่ง</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                {/* วันที่ (แปลงฟอร์แมตให้อ่านง่ายขึ้น) */}
                <td className="p-4 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                
                {/* ข้อมูลลูกค้า */}
                <td className="p-4">
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">📞 {order.phone}</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px] truncate" title={order.address}>
                    🏠 {order.address}
                  </p>
                </td>
                
                {/* ยอดเงิน */}
                <td className="p-4 font-bold text-blue-600">฿{order.total_price}</td>
                
                {/* สถานะออเดอร์ */}
                <td className="p-4">
                    <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                </td>

                {/* รายการสินค้า (อ่านจาก JSONB ที่เรายัดไว้) */}
                <td className="p-4">
                  <ul className="text-sm list-disc list-inside text-gray-600">
                    {order.items?.map((item: any, index: number) => (
                      <li key={index}>
                        {item.name} <span className="text-xs">(x{item.quantity})</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ถ้ายังไม่มีออเดอร์ให้โชว์ข้อความนี้ */}
        {orders.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            ยังไม่มีคำสั่งซื้อเข้ามาครับ นั่งตบยุงไปก่อน 🦟
          </div>
        )}
      </div>
    </main>
  );
}