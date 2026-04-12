import { NextResponse } from 'next/server';
import { getSession } from '@/shared/lib/auth';
import { db } from '@/shared/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rows = await db`
        SELECT id, name, slug, description, logo_url, phone, city, country
        FROM restaurants
        WHERE id = ${session.restaurantId}
        LIMIT 1
    `;

    if (rows.length === 0) {
        return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
}
