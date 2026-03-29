'use client';
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
    id: string;
    name: string;
    phone: string;
    role: 'customer' | 'admin' | 'waiter';
    vipLevel: string;
    totalPoints: number;
    availablePoints: number;
    referralCode: string;
}

interface SessionCtx {
    user: User | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionCtx>({
    user: null, loading: true, refresh: async () => {}, logout: async () => {}
});

export function useSession() {
    return useContext(SessionContext);
}

export function useSessionProvider() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            setUser(data.user || null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await fetch('/api/auth/session', { method: 'DELETE' });
        setUser(null);
        window.location.href = '/login';
    };

    useEffect(() => { refresh(); }, []);

    return { user, loading, refresh, logout };
}
