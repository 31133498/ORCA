import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ORCA - Omnichannel Retention and Complaint AI',
  description:
    'The omnichannel retention platform built for MTN, Airtel, Glo, and 9mobile. Voice complaints and X posts. One queue. One score. One action.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
