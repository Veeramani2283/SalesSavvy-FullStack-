import React from 'react';
import { CartIcon } from './CartIcon';
import { ProfileDropdown } from './ProfileDropdown';
import './assets/styles.css';
import Logo from './Logo';

export function Header({ cartCount, username, email, onLogoutSuccess }) {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark-theme');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Logo />
        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle light / dark theme"
          >
            🌓
          </button>
          <CartIcon count={cartCount} />
          <ProfileDropdown
            username={username}
            email={email}
            onLogoutSuccess={onLogoutSuccess}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;