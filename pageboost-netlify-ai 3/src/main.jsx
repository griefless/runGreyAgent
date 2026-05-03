import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ✅ FACEBOOK SDK INITIALIZATION
window.fbAsyncInit = function() {
  FB.init({
    appId      : '1294905135361425',
    cookie     : true,
    xfbml      : true,
    version    : 'v18.0'
  });
};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
// ✅ END FACEBOOK SDK

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
