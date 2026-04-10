import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/shared/lib/db';
import { createToken, setSessionCookie } from '@/shared/lib/auth';

const schema = z.object({
    restaurantName: z.string().min(2, 'Nombre del restaurante requerido'),
    ownerName: z.string().min(2, 'Tu nombre es requerido'),
    phone: z.string().min(9, 'Teléfono inválido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    password: z.string().min(4, 'Mínimo 4 caracteres'),
    city: z.string().optional(),
    country: z.enum(['PE', 'MX', 'CO', 'ES', 'AR', 'CL']).default('PE'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

        const { restaurantName, ownerName, phone, email, password, city, country } = parsed.data;

        // Generar slug
        let slug = restaurantName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Verificar slug único
        const existingSlug = await db`SELECT id FROM restaurants WHERE slug = ${slug}`;
        if (existingSlug.length > 0) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        // Crear restaurante
        const restaurant = await db`
            INSERT INTO restaurants (name, slug, city, country, email, phone)
            VALUES (${restaurantName}, ${slug}, ${city || null}, ${country}, ${email || null}, ${phone})
            RETURNING id, slug, name
        `;
        const restId = restaurant[0].id;

        // Crear owner
        const passwordHash = await bcrypt.hash(password, 10);
        const normalizedPhone = phone.replace(/\D/g, '');
        const referralCode = ownerName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const user = await db`
            INSERT INTO users (name, phone, email, password_hash, role, restaurant_id, referral_code)
            VALUES (${ownerName}, ${normalizedPhone}, ${email || null}, ${passwordHash}, 'admin', ${restId}, ${referralCode})
            RETURNING id, name, phone, role, vip_level
        `;

        // Crear 5 mesas por defecto
        for (let i = 1; i <= 5; i++) {
            await db`INSERT INTO tables (restaurant_id, number, name, capacity) VALUES (${restId}, ${i}, ${'Mesa ' + i}, 4)`;
        }

        // Crear recompensas default
        await db`INSERT INTO rewards (restaurant_id, name, description, points_cost, category) VALUES
            (${restId}, 'Bebida gratis', 'Una bebida de cortesía', 100, 'bebidas'),
            (${restId}, 'Postre gratis', 'Un postre de la casa', 200, 'comida'),
            (${restId}, '10% descuento', 'Descuento en tu próxima visita', 300, 'descuentos')
        `;

        const token = await createToken({
            userId: user[0].id,
            name: user[0].name,
            phone: user[0].phone,
            role: 'admin',
            vipLevel: 'bronce',
            restaurantId: restId,
            restaurantSlug: slug,
        });

        await setSessionCookie(token);

        return NextResponse.json({
            success: true,
            restaurant: { id: restId, slug, name: restaurantName },
            user: { id: user[0].id, name: user[0].name },
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create restaurant error:', error);
        return NextResponse.json({ error: error.message || 'Error al crear restaurante' }, { status: 500 });
    }
}

// GET: lista restaurantes públicos (para landing)
export async function GET() {
    try {
        const restaurants = await db`
            SELECT slug, name, description, logo_url, city, country
            FROM restaurants WHERE is_active = true
            ORDER BY created_at DESC LIMIT 50
        `;
        return NextResponse.json({ data: restaurants });
    } catch {
        return NextResponse.json({ data: [] });
    }
}
