import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, ArrowRight, User } from 'lucide-react';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto">
      <div className="w-full bg-surface border border-border-theme p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-accent-green/10 rounded-xl mb-4">
            <UserPlus className="text-accent-green" size={32} />
          </div>
          <h1 className="text-2xl font-black text-text-main">Join TypeFlow</h1>
          <p className="text-text-dim text-sm mt-1">Start your journey to typing mastery</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-bg border border-border-theme rounded-xl py-3 pl-10 pr-4 text-text-main focus:border-accent-blue outline-none transition-colors"
                placeholder="Typing Master"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border border-border-theme rounded-xl py-3 pl-10 pr-4 text-text-main focus:border-accent-blue outline-none transition-colors"
                placeholder="master@typeflow.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-border-theme rounded-xl py-3 pl-10 pr-4 text-text-main focus:border-accent-blue outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-bg border border-border-theme rounded-xl py-3 pl-10 pr-4 text-text-main focus:border-accent-blue outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-green hover:brightness-110 text-white font-bold py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-theme text-center">
          <p className="text-text-dim text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-accent-blue font-bold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
