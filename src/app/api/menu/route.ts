import { NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';
import { getSession } from '@/shared/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let slug = searchParams.get('slug');

        // Si no hay slug en query, usar el de la sesion
        if (!slug) {
            const session = await getSession();
            if (session?.restaurantSlug) {
                slug = session.restaurantSlug;
            }
        }

        // Fallback final: primer restaurante activo (compatibilidad single-tenant)
        let restaurantId: string;
        let restaurantData: any = null;
        if (slug) {
            const restaurant = await db`
                SELECT id, name, slug, description, logo_url, phone, city FROM restaurants WHERE slug = ${slug} AND is_active = true LIMIT 1
            `;
            if (restaurant.length === 0) {
                return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
            }
            restaurantId = restaurant[0].id;
            restaurantData = restaurant[0];
        } else {
            const first = await db`
                SELECT id, name, slug, description, logo_url, phone, city FROM restaurants WHERE is_active = true ORDER BY created_at ASC LIMIT 1
            `;
            if (first.length === 0) {
                return NextResponse.json({ error: 'Sin restaurantes' }, { status: 404 });
            }
            restaurantId = first[0].id;
            restaurantData = first[0];
        }

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

        return NextResponse.json({ menu, restaurant: restaurantData });
    } catch (error: any) {
        console.error('Menu error:', error);
        return NextResponse.json({ error: 'Error al cargar el menú' }, { status: 500 });
    }
}
