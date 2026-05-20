import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HomeUserMenu from '@/app/components/HomeUserMenu';

export default async function HomePage() {
    const user = await currentUser();
    if (!user) {
        redirect('/');
    }

    const profile = await prisma.professional.findUnique({
        where: { id: user.id },
    });

    if (!profile) redirect("/onboarding");

    return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between font-sans selection:bg-[#FFB800] selection:text-black">
            <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold tracking-tight">FixNow</span>
                </div>
                <div className="flex items-center gap-6">
                    <HomeUserMenu />
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-12">
                <div className="lg:col-span-12 space-y-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                        Welcome to your dashboard, {user.firstName}!
                    </h1>
                    <p className="text-slate-400 text-base md:text-lg max-w-xl font-light leading-relaxed mx-auto">
                        This is your personalized dashboard. From here, you can manage your profile, view your service history, and access exclusive features.
                    </p>
                </div>
            </main>
        </div>
    )
}