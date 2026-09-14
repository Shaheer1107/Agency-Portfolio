import type { Metadata } from 'next';
import './globals.css';
import './mobile-nav.css';

export const metadata: Metadata = {
  title: 'AutomateIQ | Intelligent Automation Agency',
  description: 'Autonomous workflows, AI agents, and resilient business automation for modern operations teams.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
