import React from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children, className = '' }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={`cc-page-enter ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;