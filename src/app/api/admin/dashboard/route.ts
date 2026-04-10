import { NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';
import { getSession } from '@/shared/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'waiter')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    const [
        todayReservations,
        totalCustomers,
        todayPoints,
        recentTransactions,
        pendingRedemptions,
    ] = await Promise.all([
        db`SELECT r.*, u.name as customer_name, u.phone as customer_phone, t.number as table_number
           FROM reservations r
           LEFT JOIN users u ON r.user_id = u.id
           LEFT JOIN tables t ON r.table_id = t.id
           WHERE r.date = ${today} AND r.restaurant_id = ${session.restaurantId}
           ORDER BY r.time`,
        db`SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND restaurant_id = ${session.restaurantId}`,
        db`SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE type = 'earn' AND created_at::date = ${today} AND restaurant_id = ${session.restaurantId}`,
        db`SELECT pt.*, u.name as customer_name FROM point_transactions pt LEFT JOIN users u ON pt.user_id = u.id WHERE pt.restaurant_id = ${session.restaurantId} ORDER BY pt.created_at DESC LIMIT 10`,
        db`SELECT rd.*, r.name as reward_name, u.name as customer_name, u.phone as customer_phone
           FROM redemptions rd
           LEFT JOIN rewards r ON rd.reward_id = r.id
           LEFT JOIN users u ON rd.user_id = u.id
           WHERE rd.status = 'pending' AND rd.restaurant_id = ${session.restaurantId}
           ORDER BY rd.created_at DESC`,
    ]);

    return NextResponse.json({
        todayReservations,
        totalCustomers: totalCustomers[0]?.count || 0,
        todayPoints: todayPoints[0]?.total || 0,
        recentTransactions,
        pendingRedemptions,
    });
}
