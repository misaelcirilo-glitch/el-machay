'use client';
import { useSession } from '@/shared/lib/useSession';
import { Flame, Star } from 'lucide-react';

export default function CartaPage() {
    const { user } = useSession();

    return (
        <div className="px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Bienvenido</p>
                    <h1 className="text-xl font-black">{user?.name?.split(' ')[0]}</h1>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                    <Star size={14} className="text-amber-400" />
                    <span className="text-amber-400 font-black text-sm">{user?.availablePoints}</span>
                    <span className="text-amber-400/60 text-[10px] uppercase font-bold">pts</span>
                </div>
            </div>

            {/* VIP Badge */}
            <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Flame size={24} className="text-white" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Nivel VIP</p>
                    <p className="text-lg font-black text-amber-400 uppercase">{user?.vipLevel}</p>
                </div>
            </div>

            {/* Menu placeholder */}
            <div>
                <h2 className="text-lg font-black mb-4">Nuestra Carta</h2>
                <div className="space-y-3">
                    {['Ceviches', 'Parrillas', 'Entradas', 'Sopas', 'Bebidas', 'Postres'].map(cat => (
                        <div key={cat} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                            <span className="font-bold">{cat}</span>
                            <span className="text-slate-500 text-sm">Próximamente</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
