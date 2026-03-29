'use client';
import { SessionContext, useSessionProvider } from '@/shared/lib/useSession';

export function Providers({ children }: { children: React.ReactNode }) {
    const session = useSessionProvider();
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
}
