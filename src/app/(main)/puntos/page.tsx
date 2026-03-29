'use client';
import { Star } from 'lucide-react';
import { useSession } from '@/shared/lib/useSession';

export default function PuntosPage() {
    const { user } = useSession();

    return (
        <div className="px-4 pt-6 space-y-6">
            <h1 className="text-xl font-black">Mis Puntos VIP</h1>

            <div className="bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl p-6 text-center space-y-2">
                <Star size={32} className="text-white mx-auto" />
                <p className="text-4xl font-black text-white">{user?.availablePoints || 0}</p>
                <p className="text-white/70 text-xs uppercase tracking-widest font-bold">Puntos disponibles</p>
                <p className="text-white/50 text-[10px]">Nivel: {user?.vipLevel?.toUpperCase()}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
                <p className="text-slate-400">Premios y canjes — PRP-004</p>
            </div>
        </div>
    );
}
