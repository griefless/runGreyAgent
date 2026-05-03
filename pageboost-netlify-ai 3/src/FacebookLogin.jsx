// src/components/FacebookLogin.jsx
import { useState, useEffect } from 'react';

export default function FacebookLogin({ onLoginSuccess }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check login status when component mounts
  useEffect(() => {
    if (window.FB) {
      window.FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
          setIsLoggedIn(true);
          handleLoginSuccess(response.authResponse);
        }
      });
    }
  }, []);

  const handleLoginClick = () => {
    if (!window.FB) {
      alert('Facebook SDK not loaded yet. Please wait a moment.');
      return;
    }
    
    setLoading(true);
    
    window.FB.login(
      (response) => {
        setLoading(false);
        if (response.authResponse) {
          setIsLoggedIn(true);
          handleLoginSuccess(response.authResponse);
        } else {
          console.log('Login cancelled or failed');
        }
      },
      {
        scope: 'public_profile,email,pages_manage_posts,pages_show_list',
        enable_profile_selector: true
      }
    );
  };

  const handleLoginSuccess = (authResponse) => {
    const { accessToken, userID } = authResponse;
    console.log('✅ Logged in! User ID:', userID);
    console.log('🔑 Access Token:', accessToken);
    
    // Fetch user's pages
    window.FB.api(
      '/me/accounts',
      { fields: 'id,name,access_token,permissions' },
      (response) => {
        if (response && !response.error) {
          console.log('📄 Pages:', response.data);
          if (onLoginSuccess) {
            onLoginSuccess({
              userId: userID,
              accessToken,
              pages: response.data
            });
          }
        } else {
          console.error('❌ Error fetching pages:', response?.error);
        }
      }
    );
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#2e7d32' }}>✓ Connected to Facebook</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleLoginClick}
      disabled={loading}
      style={{
        background: '#1877F2',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'system-ui, sans-serif',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? (
        'Connecting...'
      ) : (
        <>
          <img 
            src="https://www.facebook.com/images/fb_icon_32x32.png" 
            alt="Facebook" 
            width="20"
            height="20"
          />
          Continue with Facebook
        </>
      )}
    </button>
  );
}
