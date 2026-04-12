import { NextResponse } from 'next/server';
import { getSession } from '@/shared/lib/auth';
import { db } from '@/shared/lib/db';
import { z } from 'zod';

// GET: listar rewards del restaurante
export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rewards = await db`
        SELECT id, name, description, points_cost, category, is_active, sort_order
        FROM rewards
        WHERE restaurant_id = ${session.restaurantId}
        ORDER BY sort_order, points_cost
    `;

    return NextResponse.json({ rewards });
}

// POST: crear reward
const createSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    points_cost: z.number().int().min(1),
    category: z.enum(['discount', 'free_item', 'experience', 'merchandise']),
});

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, description, points_cost, category } = parsed.data;

    const maxOrder = await db`SELECT COALESCE(MAX(sort_order), 0) as max_order FROM rewards WHERE restaurant_id = ${session.restaurantId}`;

    await db`
        INSERT INTO rewards (name, description, points_cost, category, restaurant_id, sort_order)
        VALUES (${name}, ${description || null}, ${points_cost}, ${category}, ${session.restaurantId}, ${maxOrder[0].max_order + 1})
    `;

    return NextResponse.json({ success: true });
}

// PATCH: toggle active o editar
const patchSchema = z.object({
    id: z.string().uuid(),
    is_active: z.boolean().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    points_cost: z.number().int().min(1).optional(),
    category: z.enum(['discount', 'free_item', 'experience', 'merchandise']).optional(),
});

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { id, is_active, name, description, points_cost, category } = parsed.data;

    if (is_active !== undefined) {
        await db`UPDATE rewards SET is_active = ${is_active} WHERE id = ${id} AND restaurant_id = ${session.restaurantId}`;
    }

    if (name || description !== undefined || points_cost || category) {
        await db`
            UPDATE rewards SET
                name = COALESCE(${name || null}, name),
                description = COALESCE(${description ?? null}, description),
                points_cost = COALESCE(${points_cost || null}, points_cost),
                category = COALESCE(${category || null}, category)
            WHERE id = ${id} AND restaurant_id = ${session.restaurantId}
        `;
    }

    return NextResponse.json({ success: true });
}

// DELETE: eliminar reward
const deleteSchema = z.object({ id: z.string().uuid() });

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await db`DELETE FROM rewards WHERE id = ${parsed.data.id} AND restaurant_id = ${session.restaurantId}`;

    return NextResponse.json({ success: true });
}
