'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/shared/lib/useSession';
import { useRouter } from 'next/navigation';
import { Search, Star, CalendarDays, Users, TrendingUp, Gift, Check, LogOut, Flame, Megaphone, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminPage() {
    const { user, loading, logout } = useSession();
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dashboard, setDashboard] = useState<any>(null);
    const [tab, setTab] = useState<'points' | 'reservations' | 'redemptions' | 'promos'>('reservations');
    const [promotions, setPromotions] = useState<any[]>([]);
    const [showPromoForm, setShowPromoForm] = useState(false);
    const [promoForm, setPromoForm] = useState({ title: '', description: '', discount_type: 'percentage', discount_value: '', min_points: '', valid_from: '', valid_until: '' });
    const [promoLoading, setPromoLoading] = useState(false);

    useEffect(() => {
        if (!loading && user && user.role !== 'admin' && user.role !== 'waiter') {
            router.replace('/carta');
        }
    }, [user, loading, router]);

    useEffect(() => {
        fetch('/api/admin/dashboard').then(r => r.json()).then(setDashboard);
    }, [result]);

    useEffect(() => {
        if (tab === 'promos') {
            fetch('/api/admin/promotions').then(r => r.json()).then(d => setPromotions(d.promotions || []));
        }
    }, [tab, promoLoading]);

    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setPromoLoading(true);
        try {
            await fetch('/api/admin/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...promoForm,
                    discount_value: promoForm.discount_value ? parseFloat(promoForm.discount_value) : null,
                    min_points: promoForm.min_points ? parseInt(promoForm.min_points) : 0,
                }),
            });
            setPromoForm({ title: '', description: '', discount_type: 'percentage', discount_value: '', min_points: '', valid_from: '', valid_until: '' });
            setShowPromoForm(false);
        } finally {
            setPromoLoading(false);
        }
    };

    const togglePromo = async (id: string, is_active: boolean) => {
        setPromoLoading(true);
        try {
            await fetch('/api/admin/promotions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !is_active }),
            });
        } finally {
            setPromoLoading(false);
        }
    };

    const deletePromo = async (id: string) => {
        setPromoLoading(true);
        try {
            await fetch('/api/admin/promotions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
        } finally {
            setPromoLoading(false);
        }
    };

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
                    { id: 'promos', label: 'Promos', icon: Megaphone },
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

            {/* Promos Tab */}
            {tab === 'promos' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Promociones</h3>
                        <button
                            onClick={() => setShowPromoForm(!showPromoForm)}
                            className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full"
                        >
                            <Plus size={14} /> Nueva
                        </button>
                    </div>

                    {showPromoForm && (
                        <form onSubmit={handleCreatePromo} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                            <input
                                type="text" placeholder="Título (ej: 2x1 en Ceviches)" required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500 transition text-sm"
                                value={promoForm.title} onChange={e => setPromoForm({ ...promoForm, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Descripción (ej: Válido solo los viernes de 18:00 a 21:00)"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500 transition text-sm resize-none h-16"
                                value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-amber-500"
                                        value={promoForm.discount_type} onChange={e => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                                    >
                                        <option value="percentage">% Descuento</option>
                                        <option value="fixed">S/ Descuento</option>
                                        <option value="free_item">Gratis</option>
                                        <option value="points_multiplier">x Puntos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Valor</label>
                                    <input
                                        type="number" step="0.01" placeholder="Ej: 20"
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500 text-sm"
                                        value={promoForm.discount_value} onChange={e => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Desde</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-amber-500"
                                        value={promoForm.valid_from} onChange={e => setPromoForm({ ...promoForm, valid_from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hasta</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-amber-500"
                                        value={promoForm.valid_until} onChange={e => setPromoForm({ ...promoForm, valid_until: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit" disabled={promoLoading}
                                className="w-full py-3 bg-amber-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {promoLoading ? 'Creando...' : 'Publicar Promoción'}
                            </button>
                        </form>
                    )}

                    {promotions.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">Sin promociones creadas</p>
                    ) : promotions.map((p: any) => (
                        <div key={p.id} className={`bg-white/5 border rounded-2xl p-4 ${p.is_active ? 'border-amber-500/20' : 'border-white/10 opacity-50'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-sm">{p.title}</h4>
                                        {p.is_active && <span className="text-[9px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">Activa</span>}
                                    </div>
                                    {p.description && <p className="text-xs text-slate-400 mt-1">{p.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                                        {p.discount_type === 'percentage' && <span>{p.discount_value}% dto</span>}
                                        {p.discount_type === 'fixed' && <span>S/{p.discount_value} dto</span>}
                                        {p.discount_type === 'free_item' && <span>Item gratis</span>}
                                        {p.discount_type === 'points_multiplier' && <span>x{p.discount_value} puntos</span>}
                                        {p.valid_from && <span>Desde {p.valid_from}</span>}
                                        {p.valid_until && <span>Hasta {p.valid_until}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => togglePromo(p.id, p.is_active)} className="p-1.5 text-slate-400 hover:text-amber-400 transition">
                                        {p.is_active ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                                    </button>
                                    <button onClick={() => deletePromo(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
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
