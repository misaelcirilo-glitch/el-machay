'use client';
import { Zap, Star, UtensilsCrossed, Users, TrendingUp, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/shared/lib/useSession';
import { useI18n } from '@/shared/lib/i18n';
import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher';

export default function MyVipersLandingPage() {
    const { user, loading } = useSession();
    const router = useRouter();
    const { t } = useI18n();

    useEffect(() => {
        if (!loading && user) router.replace('/carta');
    }, [user, loading, router]);

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/5 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Zap size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-black text-white">MyVipers</span>
                    </div>
                    <div className="flex gap-3">
                        <LocaleSwitcher />
                        <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">{t.auth.login}</Link>
                        <Link href="/crear-restaurante" className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors">{t.landing.createRestaurant}</Link>
                    </div>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
                    {t.landing.tagline}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white max-w-3xl mx-auto leading-tight">
                    {t.landing.heroTitle} <span className="text-emerald-400">{t.landing.heroHighlight}</span>
                </h1>
                <p className="text-lg text-slate-400 mt-6 max-w-xl mx-auto">
                    {t.landing.heroDesc}
                </p>
                <div className="flex items-center justify-center gap-4 mt-10">
                    <Link href="/crear-restaurante" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg font-bold rounded-2xl hover:brightness-110 transition-all shadow-2xl shadow-emerald-500/30 flex items-center gap-2">
                        {t.landing.startFree} <ArrowRight size={20} />
                    </Link>
                </div>
                <p className="text-xs text-slate-600 mt-4">{t.landing.noCreditCard}</p>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Star, title: t.landing.features.vipPoints, desc: t.landing.features.vipPointsDesc, color: 'text-amber-400' },
                        { icon: UtensilsCrossed, title: t.landing.features.digitalMenu, desc: t.landing.features.digitalMenuDesc, color: 'text-blue-400' },
                        { icon: Gift, title: t.landing.features.promos, desc: t.landing.features.promosDesc, color: 'text-purple-400' },
                        { icon: Users, title: t.landing.features.crm, desc: t.landing.features.crmDesc, color: 'text-green-400' },
                        { icon: TrendingUp, title: t.landing.features.reservations, desc: t.landing.features.reservationsDesc, color: 'text-cyan-400' },
                        { icon: Zap, title: t.landing.features.multiLocation, desc: t.landing.features.multiLocationDesc, color: 'text-rose-400' },
                    ].map(f => (
                        <div key={f.title} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
                            <f.icon size={28} className={f.color} />
                            <h3 className="text-white font-bold mt-3 mb-1">{f.title}</h3>
                            <p className="text-sm text-slate-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-black text-white mb-4">{t.landing.readyTitle}</h2>
                <p className="text-slate-400 mb-8">{t.landing.readyDesc}</p>
                <Link href="/crear-restaurante" className="inline-block px-10 py-4 bg-emerald-500 text-white text-lg font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-2xl shadow-emerald-500/30">
                    {t.landing.createFree}
                </Link>
            </section>

            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-emerald-400" />
                        <span className="text-sm font-bold text-white">MyVipers</span>
                    </div>
                    <p className="text-xs text-slate-600">2026 MyVipers. {t.landing.footerText}</p>
                </div>
            </footer>
        </div>
    );
}
