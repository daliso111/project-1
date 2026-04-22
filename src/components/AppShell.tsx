import React from 'react';

interface AppShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="min-h-screen transition-colors duration-300">
      {header}
      <main className="container mx-auto max-w-[900px] pt-40 pb-20 px-6">
        {children}
      </main>
      <footer className="fixed bottom-0 w-full px-8 py-4 flex items-center justify-center pointer-events-none opacity-20">
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-text-dim">
          geometric balance &middot; typeflow precision
        </p>
      </footer>
    </div>
  );
}
