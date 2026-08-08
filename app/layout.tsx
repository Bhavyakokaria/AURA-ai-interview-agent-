import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Interview Agent - Technical Assessment Platform',
  description: 'AI Cohort Technical Interview Agent powered by Gemini LLM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
