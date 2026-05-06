'use client';

import { RiImageLine } from 'react-icons/ri';

interface ImagePlaceholderProps {
  imageNumber: number;
  description: string;
  width?: string;
  height?: string;
  dark?: boolean;
  className?: string;
}

export default function ImagePlaceholder({
  imageNumber,
  description,
  width = '100%',
  height = '240px',
  dark = false,
  className = '',
}: ImagePlaceholderProps) {
  const glassStyle: React.CSSProperties = dark
    ? {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }
    : {
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg overflow-hidden ${className}`}
      style={{ width, height, borderRadius: '12px', ...glassStyle }}
    >
      <RiImageLine
        size={24}
        style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9CA3AF' }}
      />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: dark ? 'rgba(255,255,255,0.5)' : '#6B7280',
        }}
      >
        Image {imageNumber}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          color: dark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
          textAlign: 'center',
          maxWidth: '200px',
        }}
      >
        {description}
      </span>
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '11px',
          color: dark ? 'rgba(255,255,255,0.2)' : '#D1D5DB',
          marginTop: '4px',
        }}
      >
        See image-prompts.md - Image {imageNumber}
      </span>
    </div>
  );
}
