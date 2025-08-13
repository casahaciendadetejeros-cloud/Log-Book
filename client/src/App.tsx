import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import TouristRegistration from "@/pages/tourist-registration";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import { UserPlus, ChartLine, LogOut } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/Footer";

function Navigation({ activeView, setActiveView, isLoggedIn, onLogout }: { 
  activeView: 'tourist' | 'admin', 
  setActiveView: (view: 'tourist' | 'admin') => void,
  isLoggedIn: boolean,
  onLogout: () => void
}) {
  return (
    <nav className="navbar-gradient shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          <div className="flex items-center">
            <img src="/images/rtc.png" alt="RTC Logo" className="h-8 sm:h-10 w-auto mr-2 sm:mr-3" />
            <h1 className="text-sm md:text-xl sm:text-xl font-semibold text-white">
              <span className="hidden md:inline">Tourism Office - Municipality of Rosario</span>
              <span className="md:hidden">Tourism Office - Rosario</span>
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('tourist')}
              className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center shadow-lg ${
                activeView === 'tourist'
                  ? 'text-white bg-primary-green border-2 border-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.2)] transform scale-95'
                  : 'text-white bg-white/20 border-2 border-white/40 hover:bg-white/30 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:transform active:scale-95'
              }`}
              data-testid="button-tourist-view"
            >
              <UserPlus className="h-4 w-4 sm:mr-1 md:mr-2" />
              <span className="hidden sm:inline md:hidden">Tourist</span>
              <span className="hidden md:inline">Tourist Registration</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center shadow-lg ${
                activeView === 'admin'
                  ? 'text-white bg-primary-green border-2 border-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.2)] transform scale-95'
                  : 'text-white bg-white/20 border-2 border-white/40 hover:bg-white/30 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:transform active:scale-95'
              }`}
              data-testid="button-admin-view"
            >
              <ChartLine className="h-4 w-4 sm:mr-1 md:mr-2" />
              <span className="hidden sm:inline md:hidden">Admin</span>
              <span className="hidden md:inline">Admin Dashboard</span>
            </button>
            {isLoggedIn && activeView === 'admin' && (
              <button
                onClick={onLogout}
                className="px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium text-white bg-primary-red border-2 border-white/50 hover:bg-secondary-red transition-all flex items-center shadow-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:transform active:scale-95"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 sm:mr-1 md:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const [activeView, setActiveView] = useState<'tourist' | 'admin'>('tourist');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('tourist');
  };

  const handleViewChange = (view: 'tourist' | 'admin') => {
    setActiveView(view);
  };

  // Show login page if admin is selected but not logged in
  if (activeView === 'admin' && !isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} onReturn={() => setActiveView('tourist')} />;
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/casa-full.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.8) 25%, rgba(223, 46, 56, 0.8) 100%)'
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation 
          activeView={activeView} 
          setActiveView={handleViewChange}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <div className="bg-white/10 flex-1">
          {activeView === 'tourist' ? <TouristRegistration /> : <AdminDashboard />}
        </div>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
