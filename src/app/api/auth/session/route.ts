import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/shared/lib/auth';
import { db } from '@/shared/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null });

    const result = await db`
        SELECT id, name, phone, role, vip_level, total_points, available_points, referral_code, restaurant_id
        FROM users WHERE id = ${session.userId}
    `;

    if (result.length === 0) return NextResponse.json({ user: null });

    const u = result[0];

    // Obtener slug del restaurante
    let restaurantSlug = session.restaurantSlug || null;
    if (u.restaurant_id && !restaurantSlug) {
        const rest = await db`SELECT slug FROM restaurants WHERE id = ${u.restaurant_id} LIMIT 1`;
        if (rest.length > 0) restaurantSlug = rest[0].slug;
    }

    return NextResponse.json({
        user: {
            id: u.id, name: u.name, phone: u.phone, role: u.role,
            vipLevel: u.vip_level, totalPoints: u.total_points,
            availablePoints: u.available_points, referralCode: u.referral_code,
            restaurantId: session.restaurantId || u.restaurant_id,
            restaurantSlug,
        }
    });
}

export async function DELETE() {
    await clearSession();
    return NextResponse.json({ success: true });
}
