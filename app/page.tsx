import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthButtons from "./components/AuthButtons";
import { Clock, ShieldCheck, CheckCircle2, Droplet, Zap, Flame, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function LandingPage() {
  const user = await currentUser();

  if (user) {
    const profile = await prisma.professional.findUnique({
        where: { id: user.id },
    });
    if (!profile) {
      redirect('/onboarding');
    } else {
      redirect('/home');
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between font-sans selection:bg-[#FFB800] selection:text-black">
      
      {/* HEADER / NAVBAR */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          {/* Replace text with an <Image /> component if your logo is a file */}
          <span className="text-2xl font-extrabold tracking-tight">FixNow</span>
        </div>
        
        <div className="flex items-center gap-6">
          <AuthButtons />
        </div>
      </header>

      {/* MAIN TWO-COLUMN SPLIT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-12">
        
        {/* LEFT COLUMN: Value Proposition & Copy */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              <span className="text-[#FFB800]">Tu hogar</span> <br />
              en buenas manos
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-xl font-light leading-relaxed">
              Conectamos profesionales certificados con tu hogar. Plomería, electricidad y gas en minutos, con seguimiento en tiempo real.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 border border-white/10 rounded-full text-[#FFB800]">
                <Clock size={20} />
              </div>
              <p className="text-slate-300 font-medium text-sm md:text-base">Respuesta en menos de 30 minutos</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 border border-white/10 rounded-full text-[#FFB800]">
                <ShieldCheck size={20} />
              </div>
              <p className="text-slate-300 font-medium text-sm md:text-base">Profesionales certificados</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 border border-white/10 rounded-full text-[#FFB800]">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-slate-300 font-medium text-sm md:text-base">Garantía en todos los servicios</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Illustrative Graphics Panel */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-10 lg:bg-[#0b0f19] lg:border lg:border-white/5 p-8 lg:p-12 rounded-3xl relative overflow-hidden group">
          
          {/* The Big Central Logo Display */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
            <div className="relative w-48 h-48 opacity-90 transition-transform duration-500 group-hover:scale-105">
              {/* Replace with your specific Mascot Asset */}
              <Image 
                src="/logo.png" 
                alt="FixNow Mascot" 
                width={192}
                height={192}
                priority
                className="object-contain filter brightness-110 drop-shadow-[0_0_20px_rgba(255,184,0,0.15)]"
              />
            </div>
          </div>

          {/* Service Badge Selection Matrix */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all group/card text-center">
              <Droplet size={24} className="text-blue-400 group-hover/card:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-semibold text-slate-400 group-hover/card:text-slate-200">Plomería</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-[#FFB800]/30 transition-all group/card text-center">
              <Zap size={24} className="text-[#FFB800] group-hover/card:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-semibold text-slate-400 group-hover/card:text-slate-200">Electricidad</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-red-500/30 transition-all group/card text-center">
              <Flame size={24} className="text-red-400 group-hover/card:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-semibold text-slate-400 group-hover/card:text-slate-200">Gas</span>
            </div>
          </div>

          {/* Metrics Footer Indicator */}
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full text-xs font-semibold text-slate-400">
            <Award size={14} className="text-[#FFB800]" />
            <span>+5,000 servicios completados</span>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
        <p>© 2026 FixNow. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <Link href="/privacidad" className="hover:text-slate-400 transition-colors">Privacidad</Link>
          <Link href="/terminos" className="hover:text-slate-400 transition-colors">Términos</Link>
        </div>
      </footer>
    </div>
  );
}