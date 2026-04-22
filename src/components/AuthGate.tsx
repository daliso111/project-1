import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { Login } from './Login';
import { Signup } from './Signup';
import { ProfileSetup } from './ProfileSetup';

interface AuthGateProps {
  user: User | null;
  isAuthChecking: boolean;
  isProfilePending: boolean;
  onProfileComplete: () => void;
  children: React.ReactNode;
}

export function AuthGate({
  user,
  isAuthChecking,
  isProfilePending,
  onProfileComplete,
  children,
}: AuthGateProps) {
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || isProfilePending) {
    return (
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <header className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center border-b border-border-theme bg-bg/80 backdrop-blur-md">
          <div className="flex items-center gap-2 cursor-default">
            <div className="text-2xl font-extrabold tracking-tighter text-text-main">
              Type<span className="text-accent-blue">Flow</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto max-w-[900px] pt-40 pb-20 px-6">
          {isProfilePending && user ? (
            <ProfileSetup user={user} onComplete={onProfileComplete} />
          ) : authView === 'login' ? (
            <Login onSwitchToSignup={() => setAuthView('signup')} />
          ) : (
            <Signup onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
