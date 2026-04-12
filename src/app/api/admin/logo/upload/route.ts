import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/shared/lib/auth';
import { db } from '@/shared/lib/db';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'Sin archivo' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Solo imagenes' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Maximo 5MB' }, { status: 400 });
    }

    try {
        const filename = `logos/${session.restaurantId}-${Date.now()}.${file.name.split('.').pop()}`;
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        await db`UPDATE restaurants SET logo_url = ${blob.url} WHERE id = ${session.restaurantId}`;

        return NextResponse.json({ url: blob.url });
    } catch (err: any) {
        console.error('Logo upload error:', err);
        return NextResponse.json({
            error: err.message || 'Error subiendo logo. Verifica que BLOB_READ_WRITE_TOKEN este configurado.'
        }, { status: 500 });
    }
}
