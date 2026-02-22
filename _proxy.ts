// proxy.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return request.cookies.get(name)?.value },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // 🛡️ ป้องกันหน้า /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 🚩 ระบุเมลแอดมินที่นี่ (ใช้ตัวพิมพ์เล็กทั้งหมด)
        const ADMIN_EMAIL = "admin@nextshop.com"

        // ตรวจสอบ: ถ้าไม่มี session หรือ email ไม่ตรง ให้ดีดกลับหน้าแรก
        if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*'],
}