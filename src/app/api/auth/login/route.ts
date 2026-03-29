import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/shared/lib/db';
import { createToken, setSessionCookie } from '@/shared/lib/auth';

const schema = z.object({
    phone: z.string().min(9),
    password: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

        const { phone, password } = parsed.data;

        const result = await db`
            SELECT id, name, phone, password_hash, role, vip_level, available_points
            FROM users WHERE phone = ${phone}
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Número no registrado' }, { status: 401 });
        }

        const user = result[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }

        const token = await createToken({
            userId: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            vipLevel: user.vip_level,
        });

        await setSessionCookie(token);

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, phone: user.phone, role: user.role, vipLevel: user.vip_level, points: user.available_points }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
    }
}
