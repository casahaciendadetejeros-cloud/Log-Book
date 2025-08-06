import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import TouristRegistration from "@/pages/tourist-registration";
import AdminDashboard from "@/pages/admin-dashboard";
import { BookOpen, UserPlus, ChartLine } from "lucide-react";
import { useState } from "react";

function Navigation() {
  const [activeView, setActiveView] = useState<'tourist' | 'admin'>('tourist');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="text-primary-green text-2xl mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Tourist Log Book System</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('tourist')}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                activeView === 'tourist'
                  ? 'text-primary-green bg-light-green border-primary-green'
                  : 'text-gray-600 bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
              data-testid="button-tourist-view"
            >
              <UserPlus className="inline mr-2 h-4 w-4" />
              Tourist Registration
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                activeView === 'admin'
                  ? 'text-primary-green bg-light-green border-primary-green'
                  : 'text-gray-600 bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
              data-testid="button-admin-view"
            >
              <ChartLine className="inline mr-2 h-4 w-4" />
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const [activeView, setActiveView] = useState<'tourist' | 'admin'>('tourist');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {activeView === 'tourist' ? <TouristRegistration /> : <AdminDashboard />}
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
