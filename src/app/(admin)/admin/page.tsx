'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/shared/lib/useSession';
import { useRouter } from 'next/navigation';
import { Search, Star, CalendarDays, Users, TrendingUp, Gift, Check, LogOut, Flame } from 'lucide-react';

export default function AdminPage() {
    const { user, loading, logout } = useSession();
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dashboard, setDashboard] = useState<any>(null);
    const [tab, setTab] = useState<'points' | 'reservations' | 'redemptions'>('points');

    useEffect(() => {
        if (!loading && user && user.role !== 'admin' && user.role !== 'waiter') {
            router.replace('/carta');
        }
    }, [user, loading, router]);

    useEffect(() => {
        fetch('/api/admin/dashboard').then(r => r.json()).then(setDashboard);
    }, [result]);

    const handleAssignPoints = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssigning(true);
        setResult(null);
        try {
            const res = await fetch('/api/admin/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, amount: parseFloat(amount) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
            setPhone('');
            setAmount('');
        } catch (err: any) {
            setResult({ error: err.message });
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!user || (user.role !== 'admin' && user.role !== 'waiter')) return null;

    return (
        <div className="min-h-dvh bg-[#0f0f1a] px-4 pt-6 pb-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Flame size={20} className="text-amber-400" />
                        <h1 className="text-xl font-black">El Machay</h1>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mt-0.5">Panel de Administración</p>
                </div>
                <button onClick={logout} className="p-2 text-slate-500 hover:text-red-400 transition">
                    <LogOut size={20} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <CalendarDays size={18} className="text-blue-400 mx-auto mb-1" />
                    <p className="text-xl font-black">{dashboard?.todayReservations?.length || 0}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Reservas hoy</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <Users size={18} className="text-green-400 mx-auto mb-1" />
                    <p className="text-xl font-black">{dashboard?.totalCustomers || 0}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Clientes VIP</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <Star size={18} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-xl font-black">{dashboard?.todayPoints || 0}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Puntos hoy</p>
                </div>
            </div>

            {/* Assign Points Form */}
            <div className="bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-5">
                <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} /> Asignar Puntos
                </h2>
                <form onSubmit={handleAssignPoints} className="space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="tel" placeholder="Celular del cliente" required
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500 transition text-sm"
                            value={phone} onChange={e => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">S/</span>
                        <input
                            type="number" step="0.01" placeholder="Importe consumido" required min="1"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500 transition text-sm"
                            value={amount} onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit" disabled={assigning}
                        className="w-full py-3 bg-amber-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {assigning ? 'Asignando...' : 'Asignar Puntos'}
                    </button>
                </form>

                {result && !result.error && (
                    <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                        <Check size={20} className="text-green-400" />
                        <div>
                            <p className="font-bold text-green-400 text-sm">{result.customer}: +{result.pointsAdded} pts</p>
                            <p className="text-green-400/60 text-xs">Saldo: {result.newBalance} pts | Nivel: {result.vipLevel}</p>
                        </div>
                    </div>
                )}
                {result?.error && (
                    <p className="mt-3 text-red-400 text-sm text-center">{result.error}</p>
                )}
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                {[
                    { id: 'reservations', label: 'Reservas', icon: CalendarDays },
                    { id: 'redemptions', label: 'Canjes', icon: Gift },
                    { id: 'points', label: 'Actividad', icon: TrendingUp },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${tab === t.id ? 'bg-amber-500 text-white' : 'text-slate-400'}`}
                    >
                        <t.icon size={12} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Reservations Tab */}
            {tab === 'reservations' && (
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Reservas de hoy</h3>
                    {(dashboard?.todayReservations || []).length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">Sin reservas hoy</p>
                    ) : (dashboard?.todayReservations || []).map((r: any) => (
                        <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">{r.customer_name}</p>
                                <p className="text-xs text-slate-400">{r.customer_phone} | Mesa {r.table_number} | {r.party_size} pers.</p>
                            </div>
                            <span className="text-amber-400 font-black text-sm">{r.time?.substring(0, 5)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Redemptions Tab */}
            {tab === 'redemptions' && (
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Canjes pendientes</h3>
                    {(dashboard?.pendingRedemptions || []).length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">Sin canjes pendientes</p>
                    ) : (dashboard?.pendingRedemptions || []).map((rd: any) => (
                        <div key={rd.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">{rd.customer_name}</p>
                                <p className="text-xs text-amber-400">{rd.reward_name}</p>
                                <p className="text-[10px] text-slate-500">{rd.customer_phone}</p>
                            </div>
                            <Gift size={18} className="text-amber-400" />
                        </div>
                    ))}
                </div>
            )}

            {/* Activity Tab */}
            {tab === 'points' && (
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Últimos movimientos</h3>
                    {(dashboard?.recentTransactions || []).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5">
                            <div>
                                <p className="text-sm font-bold">{t.customer_name}</p>
                                <p className="text-[10px] text-slate-500">{t.description}</p>
                            </div>
                            <span className={`font-black text-sm ${t.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {t.points > 0 ? '+' : ''}{t.points}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
