'use client';
import { CalendarDays } from 'lucide-react';

export default function ReservarPage() {
    return (
        <div className="px-4 pt-6 space-y-6">
            <h1 className="text-xl font-black">Reservar Mesa</h1>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
                <CalendarDays size={48} className="text-amber-400 mx-auto" />
                <p className="text-slate-400">Sistema de reservas — PRP-003</p>
            </div>
        </div>
    );
}
