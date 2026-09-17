import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative cc-perspective">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;