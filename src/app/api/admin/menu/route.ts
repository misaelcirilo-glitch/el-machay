import { NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';
import { getSession } from '@/shared/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'waiter')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categories = await db`
        SELECT id, name, sort_order FROM menu_categories
        WHERE is_active = true ORDER BY sort_order
    `;

    const items = await db`
        SELECT id, category_id, name, description, price, image_url,
               is_spicy, is_vegetarian, is_gluten_free, is_featured, is_available, sort_order
        FROM menu_items ORDER BY sort_order
    `;

    return NextResponse.json({ categories, items });
}
