import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { UserProvider } from './context/UserContext'; // Import UserProvider

ReactDOM.render(
  <React.StrictMode>
    <UserProvider> {/* Wrap the App with UserProvider */}
      <App />
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
