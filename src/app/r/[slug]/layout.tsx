import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    return {
        manifest: `/api/manifest?slug=${slug}`,
    };
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
