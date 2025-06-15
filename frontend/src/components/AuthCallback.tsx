import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        try {
          // Store the token in localStorage
          localStorage.setItem('token', token);
          
          // Fetch user data
          const response = await fetch('http://localhost:5000/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          setUser(userData);

          // Get the redirect URL from localStorage or default to home
          const redirectUrl = localStorage.getItem('redirectUrl') || '/';
          localStorage.removeItem('redirectUrl'); // Clean up
          
          // Redirect to the stored URL or home
          navigate(redirectUrl, { replace: true });
        } catch (error) {
          console.error('Error during authentication:', error);
          localStorage.removeItem('token');
          setUser(null);
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 