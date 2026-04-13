'use client';
import { SessionContext, useSessionProvider } from '@/shared/lib/useSession';
import { I18nContext, useI18nProvider } from '@/shared/lib/i18n';
import { RestaurantContext, useRestaurantProvider } from '@/shared/lib/useRestaurant';

export function Providers({ children }: { children: React.ReactNode }) {
    const session = useSessionProvider();
    const restaurant = useRestaurantProvider();
    const i18n = useI18nProvider(restaurant.restaurant.currency);
    return (
        <RestaurantContext.Provider value={restaurant}>
            <I18nContext.Provider value={i18n}>
                <SessionContext.Provider value={session}>
                    {children}
                </SessionContext.Provider>
            </I18nContext.Provider>
        </RestaurantContext.Provider>
    );
}
