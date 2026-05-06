'use client';

import { useEffect, useRef, useState } from 'react';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import {
  RiPhoneLine,
  RiUserUnfollowLine,
  RiDashboard3Line,
  RiArrowRightLine,
  RiCheckLine,
  RiTimeLine,
  RiBarChartGroupedLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { FaXTwitter } from 'react-icons/fa6';

/* ─── Reusable primitives ─────────────────────────────────────── */

function PrimaryButton({
  children,
  large = false,
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  const height = large ? '44px' : '36px';
  const px = large ? '24px' : '20px';
  return (
    <button
      style={{
        height,
        padding: `0 ${px}`,
        background: '#111111',
        color: '#FFFFFF',
        borderRadius: '8px',
        border: 'none',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 150ms ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background = '#000000')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background = '#111111')
      }
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  large = false,
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  const height = large ? '44px' : '36px';
  const px = large ? '24px' : '20px';
  return (
    <button
      style={{
        height,
        padding: `0 ${px}`,
        background: '#F3F4F6',
        color: '#111111',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 150ms ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background = '#E5E7EB')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6')
      }
    >
      {children}
    </button>
  );
}

/* ─── Navigation ─────────────────────────────────────────────── */

function Navbar() {
  return (
    <nav
      style={{
        height: '64px',
        background: 'rgba(250,250,250,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          color: '#111111',
          letterSpacing: '0.04em',
        }}
      >
        ORCA
      </span>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {['Features', 'How it works', 'For operators'].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#4B5563',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = '#111111')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = '#4B5563')
            }
          >
            {link}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <GhostButton>Login</GhostButton>
        <PrimaryButton>Request access</PrimaryButton>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */

function HeroCalloutChip({ label }: { label: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '6px 12px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: 500,
        color: '#111111',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
}

function OperatorLogo({ name }: { name: string }) {
  return (
    <span
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '13px',
        fontWeight: 500,
        color: '#9CA3AF',
        letterSpacing: '0.04em',
        filter: 'grayscale(1)',
      }}
    >
      {name}
    </span>
  );
}

function Hero() {
  return (
    <section
      style={{
        background: '#FAFAFA',
        padding: '96px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '55fr 45fr',
          gap: '64px',
          alignItems: 'center',
        }}
      >
        {/* Left column */}
        <div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '24px',
            }}
          >
            Omnichannel retention AI for Nigerian telecoms
          </p>

          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '56px',
              fontWeight: 700,
              color: '#111111',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              maxWidth: '520px',
              marginBottom: '20px',
            }}
          >
            Your subscriber just tweeted their way out. ORCA caught it.
          </h1>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              color: '#4B5563',
              lineHeight: 1.5,
              maxWidth: '460px',
              marginBottom: '40px',
            }}
          >
            The omnichannel retention platform built for MTN, Airtel, Glo, and
            9mobile. Voice complaints and X posts. One queue. One score. One
            action.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PrimaryButton large>Request access</PrimaryButton>
            <GhostButton large>See the platform</GhostButton>
          </div>

          <div style={{ marginTop: '48px' }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                color: '#9CA3AF',
                marginBottom: '12px',
              }}
            >
              Trusted by retention teams at
            </p>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <OperatorLogo name="MTN" />
              <OperatorLogo name="AIRTEL" />
              <OperatorLogo name="GLO" />
              <OperatorLogo name="9MOBILE" />
            </div>
          </div>
        </div>

        {/* Right column: annotated screenshot */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <ImagePlaceholder
              imageNumber={1}
              description="Agent dashboard - queue with subscriber profile panel"
              width="100%"
              height="340px"
            />
          </div>

          {/* Callout chips */}
          <div
            style={{
              position: 'absolute',
              top: '-16px',
              right: '-20px',
            }}
          >
            <HeroCalloutChip label="Churn score 94 - flagged across 3 complaints" />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '-20px',
            }}
          >
            <HeroCalloutChip label="Assigned: Agent Yemi - SLA 4h remaining" />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-16px',
              right: '24px',
            }}
          >
            <HeroCalloutChip label="ML: likely to churn in 48h without contact" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem Statement ──────────────────────────────────────── */

interface ProblemCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  body: string;
  stat: string;
}

function ProblemCard({ icon, iconColor, title, body, stat }: ProblemCardProps) {
  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '28px 24px',
        flex: '1',
      }}
    >
      <div style={{ color: iconColor }}>{icon}</div>
      <h3
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 600,
          color: '#111111',
          marginTop: '16px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#6B7280',
          marginTop: '8px',
          lineHeight: 1.5,
        }}
      >
        {body}
      </p>
      <p
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '24px',
          fontWeight: 500,
          color: '#DC2626',
          marginTop: '16px',
        }}
      >
        {stat}
      </p>
    </div>
  );
}

function ProblemStatement() {
  return (
    <section
      id="how-it-works"
      style={{ background: '#FFFFFF', padding: '80px' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '28px',
            fontWeight: 600,
            color: '#111111',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto 48px',
            lineHeight: 1.3,
          }}
        >
          The problem with churn is you find out after.
        </h2>

        <div style={{ display: 'flex', gap: '24px' }}>
          <ProblemCard
            icon={<RiPhoneLine size={32} />}
            iconColor="#DC2626"
            title="Voice complaints go to CRM, buried."
            body="Call logs pile up unread. The agent who took the call moved on. Babatunde is still waiting."
            stat="Avg response: 48h"
          />
          <ProblemCard
            icon={<FaXTwitter size={32} />}
            iconColor="#DC2626"
            title="Twitter / X complaints go nowhere."
            body="Your social team sees the tweet on Monday. The subscriber ported out on Friday."
            stat="Avg response: 72h"
          />
          <ProblemCard
            icon={<RiBarChartGroupedLine size={32} />}
            iconColor="#D97706"
            title="Usage drop-offs never get flagged."
            body="A subscriber drops from 10GB to 0.2GB. Nothing alerts. No one calls. Until they leave."
            stat="Not tracked at all."
          />
        </div>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#111111',
            textAlign: 'center',
            marginTop: '48px',
          }}
        >
          ORCA connects all three.
        </p>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────── */

function ChannelItem({
  icon,
  label,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 20px',
        borderRight: '1px solid #E5E7EB',
        color: muted ? '#9CA3AF' : '#4B5563',
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={{ background: '#FAFAFA', padding: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: '#111111',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto 48px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          From complaint to resolved - in under 3 minutes.
        </h2>

        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto 48px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          <ImagePlaceholder
            imageNumber={2}
            description="ORCA data flow: voice + X input, intelligence layer, three outputs"
            width="100%"
            height="200px"
          />
        </div>

        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              color: '#4B5563',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            Subscriber Babatunde has called three times this week. Never
            resolved. He just tweeted at @MTNNigeria and said &quot;never
            again.&quot;
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              color: '#4B5563',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            ORCA sees both signals. Scores him 94. Routes him to a senior
            retention agent with full context - call history, tweets, usage -
            before he ports out.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            overflow: 'hidden',
            width: 'fit-content',
            margin: '0 auto',
          }}
        >
          <ChannelItem icon={<RiPhoneLine size={14} />} label="Voice calls" />
          <ChannelItem icon={<FaXTwitter size={14} />} label="X / Twitter" />
          <ChannelItem
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            label="SMS"
          />
          <ChannelItem
            icon={<RiBarChartGroupedLine size={14} />}
            label="Usage data"
          />
          <ChannelItem
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            label="WhatsApp (roadmap)"
            muted
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Modules ────────────────────────────────────────── */

interface FeatureCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  body: string;
  imageNumber: number;
  imageDescription: string;
}

function FeatureCard({
  icon,
  iconColor,
  title,
  body,
  imageNumber,
  imageDescription,
}: FeatureCardProps) {
  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '32px',
      }}
    >
      <ImagePlaceholder
        imageNumber={imageNumber}
        description={imageDescription}
        width="100%"
        height="180px"
      />

      <div style={{ color: iconColor, marginTop: '24px', marginBottom: '12px' }}>
        {icon}
      </div>

      <h3
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '20px',
          fontWeight: 600,
          color: '#111111',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          fontWeight: 400,
          color: '#6B7280',
          marginTop: '8px',
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function Features() {
  return (
    <section
      id="features"
      style={{ background: '#FFFFFF', padding: '80px' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: '#111111',
            letterSpacing: '-0.02em',
            marginBottom: '40px',
          }}
        >
          Four modules. One platform.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}
        >
          <FeatureCard
            icon={<RiPhoneLine size={32} />}
            iconColor="#2563EB"
            title="Voice AI Agent"
            body="Handles calls in English, Yoruba, and Hausa. Retrieves CDR and billing context before the first word is spoken. Resolves or escalates with a full brief."
            imageNumber={3}
            imageDescription="Voice AI transcription and analysis interface"
          />
          <FeatureCard
            icon={<FaXTwitter size={32} />}
            iconColor="#111111"
            title="Social Intelligence"
            body="Monitors every mention of your brand handle in real time. Classifies, scores urgency, and auto-replies to resolvable complaints within 3 minutes."
            imageNumber={4}
            imageDescription="Live X/Twitter complaint monitoring stream"
          />
          <FeatureCard
            icon={<RiUserUnfollowLine size={32} />}
            iconColor="#DC2626"
            title="Churn Risk Engine"
            body="Every interaction builds a real-time churn score. HIGH and CRITICAL subscribers are surfaced to agents with personalised retention offers - before they port."
            imageNumber={5}
            imageDescription="Nigeria region churn risk heatmap"
          />
          <FeatureCard
            icon={<RiDashboard3Line size={32} />}
            iconColor="#059669"
            title="Human-in-the-Loop"
            body="One queue. Voice and X escalations sorted by urgency. Agents see the full context before they open their mouth or type a word."
            imageNumber={1}
            imageDescription="Agent dashboard with queue and subscriber profile"
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Metrics Strip ──────────────────────────────────────────── */

function useIntersectionToggle(threshold = 0.35) {
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setTriggered(entry.isIntersecting);
      },
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

    if (!trigger) {
      setValue(from);
      return;
    }

    const startTime = performance.now();
    const diff = to - from;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setValue(from + diff * eased);
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [trigger, from, to, duration]);

  return value;
}

function AnimatedMetric({
  render,
  label,
  border = true,
  trigger,
  delay = 0,
}: {
  render: (triggered: boolean) => React.ReactNode;
  label: string;
  border?: boolean;
  trigger: boolean;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        borderRight: border ? '1px solid rgba(255,255,255,0.15)' : 'none',
        padding: '0 48px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 400ms ease-out, transform 400ms ease-out',
      }}
    >
      <p
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '48px',
          fontWeight: 500,
          color: '#FFFFFF',
          lineHeight: 1.1,
        }}
      >
        {render(visible)}
      </p>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.5)',
          marginTop: '8px',
        }}
      >
        {label}
      </p>
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
      style={{ background: '#111111', padding: '64px 80px' }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <AnimatedMetric
          label="Response time"
          trigger={triggered}
          delay={0}
          render={(active) => <ResponseMetric trigger={active} />}
        />
        <AnimatedMetric
          label="Churn rate"
          trigger={triggered}
          delay={150}
          render={(active) => <ChurnMetric trigger={active} />}
        />
        <AnimatedMetric
          label="Revenue protected"
          border={false}
          trigger={triggered}
          delay={300}
          render={(active) => <RevenueMetric trigger={active} />}
        />
      </div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          marginTop: '32px',
          opacity: triggered ? 1 : 0,
          transition: 'opacity 600ms ease-out 500ms',
        }}
      >
        Numbers from operator pilots.
      </p>
    </section>
  );
}

/* ─── Testimonial ────────────────────────────────────────────── */

function Testimonial() {
  return (
    <section style={{ background: '#FAFAFA', padding: '80px' }}>
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <blockquote
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '22px',
            fontWeight: 400,
            color: '#111111',
            lineHeight: 1.6,
            fontStyle: 'normal',
          }}
        >
          &quot;ORCA changed how our retention team operates. We used to find
          out a customer churned from the NCC report. Now we find out before
          they decide.&quot;
        </blockquote>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#4B5563',
            marginTop: '24px',
          }}
        >
          Head of Customer Experience - [Operator Name]
        </p>

        <div
          style={{
            width: '80px',
            height: '24px',
            background: '#E5E7EB',
            borderRadius: '4px',
            margin: '16px auto 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              color: '#9CA3AF',
            }}
          >
            LOGO
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section
      id="for-operators"
      style={{
        background: '#FFFFFF',
        padding: '96px 80px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '40px',
            fontWeight: 700,
            color: '#111111',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Ready to stop losing subscribers you could have saved?
        </h2>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            color: '#4B5563',
            marginTop: '16px',
            maxWidth: '480px',
            margin: '16px auto 0',
            lineHeight: 1.5,
          }}
        >
          Request access and we&apos;ll configure ORCA for your operator&apos;s
          stack in 48 hours.
        </p>

        <div style={{ marginTop: '40px' }}>
          <PrimaryButton large>Request access</PrimaryButton>
        </div>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: '#9CA3AF',
            marginTop: '16px',
          }}
        >
          MTN, Airtel, Glo, and 9mobile configurations available.
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */

function Footer() {
  const linkStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '12px',
    transition: 'color 150ms ease',
    cursor: 'pointer',
  };

  return (
    <footer
      style={{
        background: '#0F0F0F',
        padding: '48px 80px',
        borderTop: '1px solid #1F1F1F',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '48px',
        }}
      >
        {/* Left */}
        <div>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            ORCA
          </span>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.5,
              marginBottom: '24px',
              maxWidth: '240px',
            }}
          >
            Omnichannel retention and complaint AI for Nigerian telecoms.
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            2025 ORCA. All rights reserved.
          </p>
        </div>

        {/* Middle */}
        <div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Platform
          </p>
          {['Features', 'How it works', 'Request access', 'Login'].map(
            (link) => (
              <a
                key={link}
                href="#"
                style={linkStyle}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    'rgba(255,255,255,0.85)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    'rgba(255,255,255,0.5)')
                }
              >
                {link}
              </a>
            )
          )}
        </div>

        {/* Right */}
        <div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Contact
          </p>
          <a
            href="mailto:hello@orca.ai"
            style={linkStyle}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                'rgba(255,255,255,0.85)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                'rgba(255,255,255,0.5)')
            }
          >
            hello@orca.ai
          </a>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px',
              alignItems: 'center',
            }}
          >
            <a
              href="#"
              style={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  'rgba(255,255,255,0.85)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  'rgba(255,255,255,0.5)')
              }
            >
              <FaXTwitter size={14} />
              @orca_ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main>
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
