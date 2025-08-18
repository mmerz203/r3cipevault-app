import React, { useEffect, useRef } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { createOrCheckUserDocument } from '../services/userService';

const SignInWithGoogle = () => {
  const googleButtonRef = useRef(null);

  const handleCredentialResponse = async (response) => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      console.log('Successfully signed in with Google');
      await createOrCheckUserDocument(userCredential.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // ... error handling logic
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // The script is loaded, now initialize the button
      if (googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        ref={googleButtonRef}
        className="google-signin-button"
      ></div>
      <p className="text-sm text-gray-600 text-center max-w-xs">
        Sign in to save your recipes and access them from any device
      </p>
    </div>
  );
};

export default SignInWithGoogle;
