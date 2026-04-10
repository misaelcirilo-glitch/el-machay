import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/shared/lib/db';
import { getSession } from '@/shared/lib/auth';

const schema = z.object({
    date: z.string().min(10),
    time: z.string().min(5),
    partySize: z.number().min(1).max(20),
    notes: z.string().optional(),
});

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const reservations = await db`
        SELECT r.*, t.number as table_number, t.location as table_location
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE r.user_id = ${session.userId} AND r.restaurant_id = ${session.restaurantId}
        ORDER BY r.date DESC, r.time DESC
        LIMIT 20
    `;

    return NextResponse.json({ reservations });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

        const { date, time, partySize, notes } = parsed.data;

        // Find available table
        const occupiedTables = await db`
            SELECT table_id FROM reservations
            WHERE date = ${date} AND time = ${time} AND restaurant_id = ${session.restaurantId}
            AND status NOT IN ('cancelled', 'no_show', 'completed')
        `;

        const occupiedIds = occupiedTables.map((r: any) => r.table_id).filter(Boolean);

        let tableQuery;
        if (occupiedIds.length > 0) {
            tableQuery = await db`
                SELECT id FROM tables
                WHERE capacity >= ${partySize} AND is_active = true AND restaurant_id = ${session.restaurantId}
                AND id != ALL(${occupiedIds})
                ORDER BY capacity ASC
                LIMIT 1
            `;
        } else {
            tableQuery = await db`
                SELECT id FROM tables
                WHERE capacity >= ${partySize} AND is_active = true AND restaurant_id = ${session.restaurantId}
                ORDER BY capacity ASC
                LIMIT 1
            `;
        }

        const tableId = tableQuery.length > 0 ? tableQuery[0].id : null;

        if (!tableId) {
            return NextResponse.json({ error: 'No hay mesas disponibles para esa fecha y hora. Prueba otro horario.' }, { status: 400 });
        }

        const result = await db`
            INSERT INTO reservations (user_id, restaurant_id, table_id, date, time, party_size, notes, status)
            VALUES (${session.userId}, ${session.restaurantId}, ${tableId}, ${date}, ${time}, ${partySize}, ${notes || null}, 'confirmed')
            RETURNING id, date, time, party_size, status
        `;

        return NextResponse.json({ success: true, reservation: result[0] });
    } catch (error: any) {
        console.error('Reservation error:', error);
        return NextResponse.json({ error: 'Error al crear la reserva' }, { status: 500 });
    }
}
