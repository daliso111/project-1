import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';

export const isLoggingInRef = { current: false };

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const isLoggingOut = useRef(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (isLoggingInRef.current || isInitialLoad.current) {
          setUser(currentUser);
          setIsProfilePending(!currentUser.displayName);
          isLoggingInRef.current = false;
        }
      } else if (isLoggingOut.current || isInitialLoad.current) {
        setUser(null);
        setIsProfilePending(false);
        isLoggingOut.current = false;
      }

      setIsAuthChecking(false);
      isInitialLoad.current = false;
    });

    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleLogout = async (onBeforeLogout?: () => void) => {
    try {
      isLoggingOut.current = true;
      onBeforeLogout?.();
      await signOut(auth);
      setUser(null);
      setIsProfilePending(false);
      isLoggingOut.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      isLoggingOut.current = false;
    }
  };

  return {
    user,
    isProfilePending,
    isAuthChecking,
    setIsProfilePending,
    handleLogout,
  };
}
