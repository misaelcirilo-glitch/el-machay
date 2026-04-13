export type Locale = 'es' | 'en' | 'pt';

export interface CurrencyConfig {
    code: string;
    symbol: string;
    locale: string;
}

// Common currencies - extensible, tenant can use any ISO 4217 code
export const COMMON_CURRENCIES: Record<string, CurrencyConfig> = {
    PEN: { code: 'PEN', symbol: 'S/', locale: 'es-PE' },
    USD: { code: 'USD', symbol: '$', locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    MXN: { code: 'MXN', symbol: '$', locale: 'es-MX' },
    COP: { code: 'COP', symbol: '$', locale: 'es-CO' },
    ARS: { code: 'ARS', symbol: '$', locale: 'es-AR' },
    CLP: { code: 'CLP', symbol: '$', locale: 'es-CL' },
    BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    PYG: { code: 'PYG', symbol: '₲', locale: 'es-PY' },
    BOB: { code: 'BOB', symbol: 'Bs', locale: 'es-BO' },
    UYU: { code: 'UYU', symbol: '$U', locale: 'es-UY' },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
};

export function getCurrencyConfig(code: string): CurrencyConfig {
    return COMMON_CURRENCIES[code] || { code, symbol: code, locale: 'en-US' };
}

export const LOCALE_LABELS: Record<Locale, string> = {
    es: 'Español',
    en: 'English',
    pt: 'Português',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
    es: '🇪🇸',
    en: '🇺🇸',
    pt: '🇧🇷',
};
