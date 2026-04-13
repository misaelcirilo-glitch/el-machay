import { db } from '@/shared/lib/db';
import { getSession } from '@/shared/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'waiter')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const transactions = await db`
        SELECT id, type, amount, description, category, date, created_at
        FROM finance_transactions
        ORDER BY date DESC, created_at DESC
        LIMIT 200
    `;

    const summary = await db`
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
        FROM finance_transactions
        WHERE date >= date_trunc('month', CURRENT_DATE)
    `;

    const todaySummary = await db`
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as today_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as today_expense
        FROM finance_transactions
        WHERE date = CURRENT_DATE
    `;

    return NextResponse.json({
        transactions,
        month: summary[0],
        today: todaySummary[0],
    });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, description, category, date } = body;

    if (!type || !amount || !description) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const tx = await db`
        INSERT INTO finance_transactions (type, amount, description, category, date)
        VALUES (${type}, ${amount}, ${description}, ${category || 'general'}, ${date || new Date().toISOString().split('T')[0]})
        RETURNING id, type, amount, description, category, date
    `;

    return NextResponse.json({ transaction: tx[0] });
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await req.json();
    await db`DELETE FROM finance_transactions WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
}
