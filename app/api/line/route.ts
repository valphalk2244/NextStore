import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { message, imageUrl } = await req.json() // รับทั้งข้อความและ URL รูปสลิป
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
        const to = process.env.LINE_USER_ID

        if (!token || !to) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

        // สร้างอาร์เรย์ของข้อความ (ส่งได้สูงสุด 5 messages ต่อครั้ง)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages: any[] = [
            {
                type: 'text',
                text: message,
            }
        ]

        // ถ้ามีรูปสลิป ให้ส่งรูปตามเข้าไปด้วย
        if (imageUrl) {
            messages.push({
                type: 'image',
                originalContentUrl: imageUrl, // รูปจริง
                previewImageUrl: imageUrl,    // รูปตัวอย่าง
            })
        }

        const res = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                to: to,
                messages: messages,
            }),
        })

        return NextResponse.json({ success: res.ok })
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}