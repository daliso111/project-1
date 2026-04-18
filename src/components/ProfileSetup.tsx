import React, { useState } from 'react';
import { auth } from '../firebase';
import { updateProfile, User } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { UserCircle, ArrowRight, User as UserIcon } from 'lucide-react';

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      toast.success('Profile updated!');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto">
      <div className="w-full bg-surface border border-border-theme p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-accent-blue/10 rounded-xl mb-4">
            <UserCircle className="text-accent-blue" size={32} />
          </div>
          <h1 className="text-2xl font-black text-text-main">Complete Your Profile</h1>
          <p className="text-text-dim text-sm mt-1">Please provide your details to continue</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
              <input
                type="text"
                required
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-bg border border-border-theme rounded-xl py-3 pl-10 pr-4 text-text-main focus:border-accent-blue outline-none transition-colors"
                placeholder="Typing Master"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue hover:brightness-110 text-white font-bold py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Start Typing'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
