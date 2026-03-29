import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/shared/lib/db';
import { createToken, setSessionCookie } from '@/shared/lib/auth';

const schema = z.object({
    name: z.string().min(2, 'Nombre muy corto'),
    phone: z.string().min(9, 'Teléfono inválido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    password: z.string().min(4, 'Mínimo 4 caracteres'),
    referralCode: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

        const { name, phone, email, password, referralCode } = parsed.data;

        const existing = await db`SELECT id FROM users WHERE phone = ${phone}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Este número ya está registrado' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const myReferralCode = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        let referredBy = null;
        if (referralCode) {
            const referrer = await db`SELECT id FROM users WHERE referral_code = ${referralCode.toUpperCase()}`;
            if (referrer.length > 0) referredBy = referrer[0].id;
        }

        const result = await db`
            INSERT INTO users (name, phone, email, password_hash, referral_code, referred_by)
            VALUES (${name}, ${phone}, ${email || null}, ${passwordHash}, ${myReferralCode}, ${referredBy})
            RETURNING id, name, phone, role, vip_level
        `;

        const user = result[0];

        await db`INSERT INTO point_transactions (user_id, type, points, description) VALUES (${user.id}, 'bonus', 50, 'Bienvenida VIP')`;
        await db`UPDATE users SET total_points = 50, available_points = 50 WHERE id = ${user.id}`;

        if (referredBy) {
            const desc = `Referido: ${name}`;
            await db`INSERT INTO point_transactions (user_id, type, points, description) VALUES (${referredBy}, 'referral', 100, ${desc})`;
            await db`UPDATE users SET total_points = total_points + 100, available_points = available_points + 100 WHERE id = ${referredBy}`;
        }

        const token = await createToken({
            userId: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            vipLevel: user.vip_level,
        });

        await setSessionCookie(token);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, vipLevel: user.vip_level, points: 50 } });
    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Error al registrar' }, { status: 500 });
    }
}
