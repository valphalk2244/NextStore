// store/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// กำหนดหน้าตาของสินค้าในตะกร้า
export interface CartItem {
    id: string
    name: string
    price: number
    image_url: string
    quantity: number
}

// กำหนดฟังก์ชันการทำงานของตะกร้า
interface CartState {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string) => void
    clearCart: () => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            // ฟังก์ชันเพิ่มลงตะกร้า (ถ้ามีอยู่แล้วให้บวกจำนวนเพิ่ม)
            addItem: (item) =>
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id)
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        }
                    }
                    return { items: [...state.items, { ...item, quantity: 1 }] }
                }),
            // ฟังก์ชันลบสินค้าออกจากตะกร้า
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),
            // ฟังก์ชันล้างตะกร้า
            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'ecommerce-cart', // ชื่อ key ที่จะบันทึกใน localStorage
        }
    )
)