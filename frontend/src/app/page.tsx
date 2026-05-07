'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import {
  RiPhoneLine,
  RiUserUnfollowLine,
  RiDashboard3Line,
  RiBarChartGroupedLine,
  RiMenuLine,
  RiCloseLine,
} from 'react-icons/ri';
import { FaXTwitter, FaFacebook, FaInstagram, FaReddit } from 'react-icons/fa6';

/* ─── Animation hooks ────────────────────────────────────────── */

function useIntersectionToggle(threshold = 0.35) {
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTriggered(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, triggered };
}

function useCountDown(from: number, to: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(from);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!trigger) { setValue(from); return; }

    const startTime = performance.now();
    const diff = to - from;
    const tick = (now: number) => {
      const raw = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setValue(from + diff * eased);
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [trigger, from, to, duration]);

  return value;
}

/* ─── Reusable primitives ────────────────────────────────────── */

function PrimaryButton({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button
      className={`h-11 px-6 bg-[#FACC15] text-[#0A0A0A] rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-150 hover:bg-[#FDE047] active:scale-[0.98] cursor-pointer shadow-[0_0_0_1px_rgba(250,204,21,0.4),0_8px_24px_-8px_rgba(250,204,21,0.5)]${fullWidth ? ' w-full' : ''}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button
      className={`h-11 px-6 bg-transparent text-[#FAFAFA] rounded-lg text-sm font-medium border border-[#262626] whitespace-nowrap transition-colors duration-150 hover:bg-[#141414] hover:border-[#404040] cursor-pointer${fullWidth ? ' w-full' : ''}`}
    >
      {children}
    </button>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1A1A1A] bg-[rgba(10,10,10,0.85)] backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-20 h-16 flex items-center justify-between">
        <span className="font-bold text-base tracking-[0.04em] text-[#FAFAFA]">
          ORCA<span className="text-[#FACC15]">.</span>
        </span>

        <div className="hidden md:flex gap-8 items-center">
          {['Features', 'How it works', 'For operators'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-[#A3A3A3] hover:text-[#FACC15] transition-colors duration-150 no-underline"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          <Link href="/dashboard" className="no-underline"><GhostButton>Open dashboard</GhostButton></Link>
          <PrimaryButton>Request access</PrimaryButton>
        </div>

        <button
          className="md:hidden p-2 text-[#A3A3A3] hover:text-[#FACC15] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-[#1A1A1A] px-4 py-4 flex flex-col gap-3">
          {['Features', 'How it works', 'For operators'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-[#A3A3A3] hover:text-[#FACC15] py-2 no-underline"
              onClick={() => setOpen(false)}
            >
              {link}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/dashboard" className="no-underline"><GhostButton fullWidth>Open dashboard</GhostButton></Link>
            <PrimaryButton fullWidth>Request access</PrimaryButton>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */

function HeroCalloutChip({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.5)] border ${
        accent
          ? 'bg-[#FACC15] text-[#0A0A0A] border-[#FDE047]'
          : 'bg-[#141414] text-[#FAFAFA] border-[#262626]'
      }`}
    >
      {label}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative bg-[#0A0A0A] px-4 sm:px-6 lg:px-20 py-14 lg:py-24 overflow-hidden">
      {/* ambient yellow glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px] opacity-20"
        style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full blur-[120px] opacity-10"
        style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }}
      />

      <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 lg:gap-16 items-center">

        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#FACC15] uppercase tracking-[0.1em] mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FACC15] animate-pulse" />
            Omnichannel retention AI for Nigerian telecoms
          </p>

          <h1 className="font-bold text-[36px] sm:text-[44px] lg:text-[56px] text-[#FAFAFA] leading-[1.15] tracking-[-0.02em] max-w-[560px] mb-5">
            95.7 million subscribers. Complaints on 4 platforms.{' '}
            <span className="text-[#FACC15]">One queue.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed max-w-[460px] mb-10">
            ORCA unifies Facebook, Instagram, X, and Reddit complaints for MTN Nigeria into a single intelligence layer — scoring churn risk in real time and routing to agents before subscribers port out.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="no-underline"><PrimaryButton>Open dashboard</PrimaryButton></Link>
            <GhostButton>See the platform</GhostButton>
          </div>

          <div className="mt-10">
            <p className="text-xs text-[#737373] mb-3 uppercase tracking-[0.1em]">Trusted by retention teams at</p>
            <div className="flex flex-wrap gap-5 items-center">
              {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map((op) => (
                <span key={op} className="font-mono text-sm font-medium text-[#737373] tracking-[0.08em] hover:text-[#FACC15] transition-colors">
                  {op}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-4 lg:mt-0">
          <div className="rounded-xl border border-[#262626] bg-[#141414] shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(250,204,21,0.08)] overflow-hidden">
            <ImagePlaceholder
              imageNumber={1}
              description="Agent dashboard - queue with subscriber profile panel"
              width="100%"
              height="300px"
              dark
            />
          </div>

          <div className="hidden sm:block absolute -top-4 right-0 lg:-right-4">
            <HeroCalloutChip accent label="Churn score 94 - flagged across 3 complaints" />
          </div>
          <div className="hidden sm:block absolute bottom-14 left-0 lg:-left-4">
            <HeroCalloutChip label="Assigned: Agent Yemi - SLA 4h remaining" />
          </div>
          <div className="hidden sm:block absolute -bottom-4 right-6">
            <HeroCalloutChip label="ML: likely to churn in 48h without contact" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem Statement ──────────────────────────────────────── */

function ProblemCard({ icon, title, body, stat }: {
  icon: React.ReactNode; title: string; body: string; stat: string;
}) {
  return (
    <div className="flex-1 bg-[#141414] border border-[#262626] rounded-xl p-6 lg:p-7 transition-colors hover:border-[#FACC15]/40">
      <div className="text-[#FACC15]">{icon}</div>
      <h3 className="text-base font-semibold text-[#FAFAFA] mt-4">{title}</h3>
      <p className="text-sm text-[#A3A3A3] mt-2 leading-relaxed">{body}</p>
      <p className="font-mono text-2xl font-medium text-[#FACC15] mt-4">{stat}</p>
    </div>
  );
}

function ProblemStatement() {
  return (
    <section id="how-it-works" className="bg-[#000000] px-4 sm:px-6 lg:px-20 py-14 lg:py-20 border-y border-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl sm:text-[28px] font-semibold text-[#FAFAFA] text-center max-w-[560px] mx-auto mb-10 leading-snug">
          The problem with churn is{' '}
          <span className="text-[#FACC15]">you find out after.</span>
        </h2>

        {/* Market stats bar */}
        <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { stat: '95.7M', label: 'MTN subscribers', sub: '51.6% market share (NCC 2026)' },
            { stat: '38–47M', label: 'Facebook users (NG)', sub: 'Widest reach — mass-market' },
            { stat: '10M', label: 'Instagram users (NG)', sub: 'Young, urban, vocal' },
            { stat: '7.5M', label: 'X/Twitter users (NG)', sub: 'High-signal, loud minority' },
          ].map(({ stat, label, sub }) => (
            <div key={label} className="rounded-lg border border-[#262626] bg-[#141414] p-4">
              <p className="font-mono text-[22px] font-bold text-[#FACC15]">{stat}</p>
              <p className="text-[13px] font-semibold text-[#FAFAFA] mt-0.5">{label}</p>
              <p className="text-[11px] text-[#737373] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <ProblemCard
            icon={<RiPhoneLine size={32} />}
            title="Voice complaints go to CRM, buried."
            body="Call logs pile up unread. The agent who took the call moved on. Babatunde is still waiting."
            stat="Avg response: 48h"
          />
          <ProblemCard
            icon={<FaFacebook size={32} />}
            title="Facebook posts reach 5× more subscribers."
            body="A complaint on Facebook reaches 47M Nigerians. Your social team is only watching X — missing 80% of the signal."
            stat="4 platforms, 0 unification"
          />
          <ProblemCard
            icon={<RiBarChartGroupedLine size={32} />}
            title="Fragmented signals. No single score."
            body="X captures 7.5M users. Facebook captures 47M. Instagram 10M. Reddit is where engineers post analysis. Each silo misses churn."
            stat="Signal fragmented across 4+"
          />
        </div>

        <p className="text-lg font-semibold text-[#FAFAFA] text-center mt-12">
          ORCA <span className="text-[#FACC15]">unifies all four into one churn signal.</span>
        </p>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section className="bg-[#0A0A0A] px-4 sm:px-6 lg:px-20 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl sm:text-[36px] font-bold text-[#FAFAFA] text-center max-w-[640px] mx-auto mb-12 leading-tight tracking-[-0.02em]">
          From complaint to resolved —{' '}
          <span className="text-[#FACC15]">in under 3 minutes.</span>
        </h2>

        <div className="max-w-[800px] mx-auto mb-12 rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
          <ImagePlaceholder
            imageNumber={2}
            description="ORCA data flow: voice + X input, intelligence layer, three outputs"
            width="100%"
            height="180px"
            dark
          />
        </div>

        <div className="max-w-[640px] mx-auto flex flex-col gap-4 mb-12">
          {[
            'Subscriber Babatunde has called three times this week. Never resolved. He just tweeted at @MTNNigeria and said "never again."',
            'ORCA sees both signals. Scores him 94. Routes him to a senior retention agent with full context — call history, tweets, usage — before he ports out.',
          ].map((text, i) => (
            <p key={i} className="text-base text-[#A3A3A3] leading-relaxed text-center">{text}</p>
          ))}
        </div>

        <div className="flex flex-wrap justify-center border border-[#262626] rounded-lg overflow-hidden w-fit mx-auto bg-[#141414]">
          {[
            { icon: <FaFacebook size={14} />, label: 'Facebook', color: '#1877F2' },
            { icon: <FaInstagram size={14} />, label: 'Instagram', color: '#E1306C' },
            { icon: <FaXTwitter size={14} />, label: 'X / Twitter', color: '#FFFFFF' },
            { icon: <FaReddit size={14} />, label: 'Reddit', color: '#FF4500' },
            { icon: <RiPhoneLine size={14} />, label: 'Voice calls', color: '#FACC15' },
            { icon: <RiBarChartGroupedLine size={14} />, label: 'Usage data', color: '#FACC15' },
          ].map(({ icon, label, color }, i, arr) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium ${i < arr.length - 1 ? 'border-r border-[#262626]' : ''}`}
              style={{ color }}
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Modules ────────────────────────────────────────── */

function FeatureCard({ icon, title, body, imageNumber, imageDescription }: {
  icon: React.ReactNode; title: string; body: string;
  imageNumber: number; imageDescription: string;
}) {
  return (
    <div className="group bg-[#141414] border border-[#262626] rounded-2xl p-6 lg:p-8 transition-all duration-200 hover:border-[#FACC15]/50 hover:shadow-[0_0_40px_-15px_rgba(250,204,21,0.4)]">
      <div className="rounded-lg overflow-hidden border border-[#262626]">
        <ImagePlaceholder imageNumber={imageNumber} description={imageDescription} width="100%" height="180px" dark />
      </div>
      <div className="mt-6 mb-3 text-[#FACC15]">{icon}</div>
      <h3 className="text-xl font-semibold text-[#FAFAFA]">{title}</h3>
      <p className="text-[15px] text-[#A3A3A3] mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-[#000000] px-4 sm:px-6 lg:px-20 py-14 lg:py-20 border-y border-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-xs font-semibold text-[#FACC15] uppercase tracking-[0.1em] mb-3">The platform</p>
        <h2 className="text-3xl sm:text-[36px] font-bold text-[#FAFAFA] mb-10 tracking-[-0.02em]">
          Four modules. <span className="text-[#FACC15]">One platform.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FeatureCard icon={<RiPhoneLine size={32} />} title="Voice AI Agent"
            body="Handles calls in English, Yoruba, and Hausa. Retrieves CDR and billing context before the first word is spoken. Resolves or escalates with a full brief."
            imageNumber={3} imageDescription="Voice AI transcription and analysis interface" />
          <FeatureCard icon={<FaFacebook size={32} />} title="Multi-Platform Intelligence"
            body="Monitors Facebook, Instagram, X, and Reddit in real time. Facebook alone reaches 47M Nigerians — 6× the X audience. Every complaint, every platform, one queue."
            imageNumber={4} imageDescription="Live multi-platform complaint monitoring stream" />
          <FeatureCard icon={<RiUserUnfollowLine size={32} />} title="Churn Risk Engine"
            body="Every interaction builds a real-time churn score. HIGH and CRITICAL subscribers are surfaced to agents with personalised retention offers - before they port."
            imageNumber={5} imageDescription="Nigeria region churn risk heatmap" />
          <FeatureCard icon={<RiDashboard3Line size={32} />} title="Human-in-the-Loop"
            body="One queue. Voice and X escalations sorted by urgency. Agents see the full context before they open their mouth or type a word."
            imageNumber={1} imageDescription="Agent dashboard with queue and subscriber profile" />
        </div>
      </div>
    </section>
  );
}

/* ─── Metrics Strip ──────────────────────────────────────────── */

function AnimatedMetric({ render, label, trigger, delay = 0, divider = true }: {
  render: (t: boolean) => React.ReactNode; label: string;
  trigger: boolean; delay?: number; divider?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!trigger) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <div
      className={`flex-1 text-center py-8 lg:py-0 ${divider ? 'border-b lg:border-b-0 lg:border-r border-[rgba(250,204,21,0.2)]' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 400ms ease-out, transform 400ms ease-out',
      }}
    >
      <p className="font-mono text-[40px] sm:text-[48px] font-medium text-[#FACC15] leading-tight">
        {render(visible)}
      </p>
      <p className="text-sm text-[#A3A3A3] mt-2 uppercase tracking-[0.1em]">{label}</p>
    </div>
  );
}

function ResponseMetric({ trigger }: { trigger: boolean }) {
  const val = useCountDown(48, 4, 1600, trigger);
  return <span>48h to {Math.round(val)}h</span>;
}
function ChurnMetric({ trigger }: { trigger: boolean }) {
  const val = useCountDown(12, 4, 1400, trigger);
  return <span>12% to {Math.round(val)}%</span>;
}
function RevenueMetric({ trigger }: { trigger: boolean }) {
  const val = useCountDown(0, 2.4, 1800, trigger);
  return <span>N{val.toFixed(1)}B</span>;
}

function MetricsStrip() {
  const { ref, triggered } = useIntersectionToggle(0.35);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative bg-[#FACC15] px-4 sm:px-6 lg:px-20 py-12 lg:py-16 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 12px)',
        }}
      />
      <div className="relative max-w-[1200px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center">
        <AnimatedMetricDark label="Response time" trigger={triggered} delay={0} render={(a) => <ResponseMetric trigger={a} />} />
        <AnimatedMetricDark label="Churn rate" trigger={triggered} delay={150} render={(a) => <ChurnMetric trigger={a} />} />
        <AnimatedMetricDark label="Revenue protected" trigger={triggered} delay={300} divider={false} render={(a) => <RevenueMetric trigger={a} />} />
      </div>
      <p
        className="relative text-[13px] text-center mt-8 text-[rgba(10,10,10,0.6)] uppercase tracking-[0.1em] font-medium"
        style={{ opacity: triggered ? 1 : 0, transition: 'opacity 600ms ease-out 500ms' }}
      >
        Numbers from operator pilots.
      </p>
    </section>
  );
}

function AnimatedMetricDark({ render, label, trigger, delay = 0, divider = true }: {
  render: (t: boolean) => React.ReactNode; label: string;
  trigger: boolean; delay?: number; divider?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!trigger) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <div
      className={`flex-1 text-center py-8 lg:py-0 ${divider ? 'border-b lg:border-b-0 lg:border-r border-[rgba(10,10,10,0.2)]' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 400ms ease-out, transform 400ms ease-out',
      }}
    >
      <p className="font-mono text-[40px] sm:text-[48px] font-bold text-[#0A0A0A] leading-tight">
        {render(visible)}
      </p>
      <p className="text-sm text-[rgba(10,10,10,0.65)] mt-2 uppercase tracking-[0.1em] font-semibold">{label}</p>
    </div>
  );
}

/* ─── Testimonial ────────────────────────────────────────────── */

function Testimonial() {
  return (
    <section className="bg-[#0A0A0A] px-4 sm:px-6 lg:px-20 py-14 lg:py-20">
      <div className="max-w-[640px] mx-auto text-center">
        <p className="text-[#FACC15] font-mono text-4xl mb-4 leading-none">&ldquo;</p>
        <blockquote className="text-xl sm:text-[22px] text-[#FAFAFA] leading-relaxed">
          ORCA changed how our retention team operates. We used to find out a customer churned
          from the NCC report. <span className="text-[#FACC15]">Now we find out before they decide.</span>
        </blockquote>
        <p className="text-sm font-medium text-[#A3A3A3] mt-6">
          Head of Customer Experience — [Operator Name]
        </p>
        <div className="w-20 h-6 bg-[#141414] border border-[#262626] rounded mx-auto mt-4 flex items-center justify-center">
          <span className="font-mono text-[11px] text-[#525252]">LOGO</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section id="for-operators" className="relative bg-[#000000] px-4 sm:px-6 lg:px-20 py-14 lg:py-24 text-center overflow-hidden border-t border-[#1A1A1A]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full blur-[140px] opacity-15"
        style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }}
      />
      <div className="relative max-w-[1200px] mx-auto">
        <h2 className="text-3xl sm:text-[40px] font-bold text-[#FAFAFA] max-w-[640px] mx-auto leading-tight tracking-[-0.02em]">
          Ready to stop losing subscribers{' '}
          <span className="text-[#FACC15]">you could have saved?</span>
        </h2>
        <p className="text-base sm:text-lg text-[#A3A3A3] mt-4 max-w-[480px] mx-auto leading-relaxed">
          Request access and we&apos;ll configure ORCA for your operator&apos;s stack in 48 hours.
        </p>
        <div className="flex justify-center mt-10">
          <PrimaryButton>Request access</PrimaryButton>
        </div>
        <p className="text-[13px] text-[#737373] mt-4">
          MTN Nigeria · 95.7M subscribers · 51.6% market share. Facebook, Instagram, X, Reddit + Voice.
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-[#1A1A1A] px-4 sm:px-6 lg:px-20 py-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <span className="font-bold text-base tracking-[0.04em] text-[#FAFAFA] block mb-3">
            ORCA<span className="text-[#FACC15]">.</span>
          </span>
          <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-[240px] mb-6">
            Omnichannel retention and complaint AI for Nigerian telecoms.
          </p>
          <p className="text-[13px] text-[#525252]">© {new Date().getFullYear()} ORCA. All rights reserved.</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#FACC15] uppercase tracking-[0.08em] mb-4">Platform</p>
          {['Features', 'How it works', 'Request access', 'Login'].map((link) => (
            <a key={link} href="#"
              className="block text-sm text-[#A3A3A3] hover:text-[#FACC15] transition-colors duration-150 no-underline mb-3">
              {link}
            </a>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-[#FACC15] uppercase tracking-[0.08em] mb-4">Contact</p>
          <a href="mailto:hello@orca.ai"
            className="block text-sm text-[#A3A3A3] hover:text-[#FACC15] transition-colors duration-150 no-underline mb-3">
            hello@orca.ai
          </a>
          <a href="#"
            className="inline-flex items-center gap-1.5 text-sm text-[#A3A3A3] hover:text-[#FACC15] transition-colors duration-150 no-underline">
            <FaXTwitter size={14} />
            @orca_ai
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="bg-[#0A0A0A] text-[#FAFAFA]">
      <Navbar />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <Features />
      <MetricsStrip />
      <Testimonial />
      <FinalCTA />
      <Footer />
    </main>
  );
}
