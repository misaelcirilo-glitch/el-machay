import { NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Se requiere el parámetro slug' }, { status: 400 });
        }

        // Buscar restaurant por slug
        const restaurant = await db`
            SELECT id FROM restaurants WHERE slug = ${slug} LIMIT 1
        `;

        if (restaurant.length === 0) {
            return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
        }

        const restaurantId = restaurant[0].id;

        const categories = await db`
            SELECT id, name, description, sort_order, image_url FROM menu_categories
            WHERE is_active = true AND restaurant_id = ${restaurantId} ORDER BY sort_order
        `;

        const items = await db`
            SELECT id, category_id, name, description, price, image_url,
                   is_spicy, is_vegetarian, is_gluten_free, is_featured, is_available
            FROM menu_items WHERE is_available = true AND restaurant_id = ${restaurantId} ORDER BY sort_order
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
