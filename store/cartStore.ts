import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 🛒 กำหนดโครงสร้างสินค้า
interface CartItem {
    id: string
    name: string
    price: number
    image_url: string
    quantity: number
}

interface CartState {
    items: CartItem[]
    userId: string | null // เก็บ ID ของผู้ใช้ปัจจุบัน
    setUserId: (id: string | null) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addItem: (product: any) => void
    removeItem: (id: string) => void
    decreaseItem: (id: string) => void
    clearCart: () => void
    totalPrice: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            userId: null,

            // 🆔 ตั้งค่า User ID และตรวจสอบว่าถ้าเปลี่ยนคน ให้ล้างตะกร้าเก่า
            setUserId: (id) => {
                if (get().userId !== id) {
                    set({ items: [], userId: id })
                }
            },

            addItem: (product) => {
                const items = get().items
                const exists = items.find((i) => i.id === product.id)

                if (exists) {
                    set({
                        items: items.map((i) =>
                            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    })
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] })
                }
            },

            decreaseItem: (id) => {
                const items = get().items
                set({
                    items: items.map((i) =>
                        i.id === id && i.quantity > 1
                            ? { ...i, quantity: i.quantity - 1 }
                            : i
                    ),
                })
            },

            removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

            clearCart: () => set({ items: [] }),

            totalPrice: () => get().items.reduce((total, i) => total + i.price * i.quantity, 0),
        }),
        {
            name: 'cart-storage', // ชื่อ key ใน LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
)