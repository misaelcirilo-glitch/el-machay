import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({
            name: 'MyVipers',
            short_name: 'MyVipers',
            description: 'Plataforma de fidelización para restaurantes',
            start_url: '/',
            display: 'standalone',
            background_color: '#0f0f1a',
            theme_color: '#1a1a2e',
            orientation: 'portrait',
            icons: [
                { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            ],
        }, { headers: { 'Content-Type': 'application/manifest+json' } });
    }

    const rows = await db`
        SELECT name, logo_url, description
        FROM restaurants
        WHERE slug = ${slug} AND is_active = true
        LIMIT 1
    `;

    const restaurant = rows[0];

    const icons = restaurant?.logo_url
        ? [
            { src: restaurant.logo_url, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: restaurant.logo_url, sizes: '512x512', type: 'image/png', purpose: 'any' },
        ]
        : [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ];

    return NextResponse.json({
        name: restaurant?.name || slug,
        short_name: restaurant?.name || slug,
        description: restaurant?.description || `Club VIP de ${restaurant?.name || slug}`,
        start_url: `/r/${slug}`,
        display: 'standalone',
        background_color: '#0f0f1a',
        theme_color: '#1a1a2e',
        orientation: 'portrait',
        icons,
    }, { headers: { 'Content-Type': 'application/manifest+json' } });
}
