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
    <nav className="navbar-gradient shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="/images/rtc.png" alt="RTC Logo" className="h-8 sm:h-10 w-auto mr-2 sm:mr-3" />
            <h1 className="text-sm sm:text-xl font-semibold text-white">
              <span className="hidden md:inline">Tourism Office - Municipality of Rosario</span>
              <span className="md:hidden">Tourism Office - Rosario</span>
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('tourist')}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium border transition-colors text-sm sm:text-base ${
                activeView === 'tourist'
                  ? 'text-white bg-primary-green border-white'
                  : 'text-white bg-white/20 border-white/30 hover:bg-white/30'
              }`}
              data-testid="button-tourist-view"
            >
              <UserPlus className="inline mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Tourist Registration</span>
              <span className="sm:hidden">Tourist</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium border transition-colors text-sm sm:text-base ${
                activeView === 'admin'
                  ? 'text-white bg-primary-green border-white'
                  : 'text-white bg-white/20 border-white/30 hover:bg-white/30'
              }`}
              data-testid="button-admin-view"
            >
              <ChartLine className="inline mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Admin Dashboard</span>
              <span className="sm:hidden">Admin</span>
            </button>
            {isLoggedIn && activeView === 'admin' && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg font-medium border text-white bg-primary-red border-white hover:bg-secondary-red transition-colors"
                data-testid="button-logout"
              >
                <LogOut className="inline mr-2 h-4 w-4" />
                Logout
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
