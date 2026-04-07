import { NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';
import { getSession } from '@/shared/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, price, image_url, is_available, is_featured, is_spicy, is_vegetarian, is_gluten_free } = body;

    const result = await db`
        UPDATE menu_items
        SET
            name = COALESCE(${name}, name),
            description = COALESCE(${description}, description),
            price = COALESCE(${price}, price),
            image_url = COALESCE(${image_url}, image_url),
            is_available = COALESCE(${is_available}, is_available),
            is_featured = COALESCE(${is_featured}, is_featured),
            is_spicy = COALESCE(${is_spicy}, is_spicy),
            is_vegetarian = COALESCE(${is_vegetarian}, is_vegetarian),
            is_gluten_free = COALESCE(${is_gluten_free}, is_gluten_free)
        WHERE id = ${id}
        RETURNING *
    `;

    if (result.length === 0) {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ item: result[0] });
}
