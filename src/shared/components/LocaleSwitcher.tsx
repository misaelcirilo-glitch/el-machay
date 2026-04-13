'use client';
import { useState, useRef, useEffect } from 'react';
import { useI18n, LOCALE_LABELS, LOCALE_FLAGS } from '@/shared/lib/i18n';
import type { Locale } from '@/shared/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

export function LocaleSwitcher() {
    const { locale, setLocale, currencyConfig } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 bg-[#1a1a2e] border border-[#2a2a3e] px-3 py-2 rounded-xl text-xs text-slate-300 hover:border-amber-500/30 transition"
            >
                <Globe size={14} className="text-amber-400" />
                <span>{LOCALE_FLAGS[locale]}</span>
                <span className="font-bold">{currencyConfig.symbol}</span>
                <ChevronDown size={12} className="text-slate-500" />
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                    <div className="p-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-2 py-1">
                            {locale === 'es' ? 'Idioma' : locale === 'en' ? 'Language' : 'Idioma'}
                        </p>
                        {(Object.keys(LOCALE_LABELS) as Locale[]).map(l => (
                            <button
                                key={l}
                                onClick={() => { setLocale(l); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${locale === l ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                                <span>{LOCALE_FLAGS[l]}</span>
                                <span>{LOCALE_LABELS[l]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
