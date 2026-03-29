import { NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';

export async function GET() {
    try {
        const categories = await db`
            SELECT id, name, description, sort_order FROM menu_categories
            WHERE is_active = true ORDER BY sort_order
        `;

        const items = await db`
            SELECT id, category_id, name, description, price, image_url,
                   is_spicy, is_vegetarian, is_gluten_free, is_featured, is_available
            FROM menu_items WHERE is_available = true ORDER BY sort_order
        `;

        const menu = categories.map((cat: any) => ({
            ...cat,
            items: items.filter((item: any) => item.category_id === cat.id),
        }));

        return NextResponse.json({ menu });
    } catch (error: any) {
        console.error('Menu error:', error);
        return NextResponse.json({ error: 'Error al cargar el menú' }, { status: 500 });
    }
}
