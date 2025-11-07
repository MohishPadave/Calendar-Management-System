import React, { useState } from 'react';
import CalendarView from './components/Calendar/CalendarView';
import { CalendarEvent } from './components/Calendar/CalendarView.types';
import { ThemeProvider } from './contexts/ThemeContext';
import { generateEventId } from './utils/event.utils';
import OnboardingTour from './components/Onboarding/OnboardingTour';
import QuickTips from './components/Onboarding/QuickTips';
import { useOnboarding } from './hooks/useOnboarding';

// Sample events for demo
const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync and planning session',
    startDate: new Date(2024, 10, 15, 9, 0), // Nov 15, 2024, 9:00 AM
    endDate: new Date(2024, 10, 15, 10, 0),
    color: '#3b82f6',
    category: 'Work',
  },
  {
    id: '2',
    title: 'Lunch Break',
    description: 'Time to recharge',
    startDate: new Date(2024, 10, 15, 12, 0),
    endDate: new Date(2024, 10, 15, 13, 0),
    color: '#10b981',
    category: 'Personal',
  },
  {
    id: '3',
    title: 'Project Review',
    description: 'Review Q4 project progress',
    startDate: new Date(2024, 10, 16, 14, 0),
    endDate: new Date(2024, 10, 16, 16, 0),
    color: '#f59e0b',
    category: 'Work',
  },
];

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const { showOnboarding, completeOnboarding, skipOnboarding, startOnboarding } = useOnboarding();
  const [showQuickTips, setShowQuickTips] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const handleEventAdd = (event: CalendarEvent) => {
    console.log('App: Adding event:', event);
    setEvents(prev => [...prev, event]);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    console.log('App: Updating event:', id, updates);
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const handleEventDelete = (id: string) => {
    console.log('App: Deleting event:', id);
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen w-full bg-white dark:bg-[#1f1f1f] relative">
        <CalendarView
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          initialView="month"
          initialDate={new Date(2024, 10, 15)} // Nov 15, 2024
        />

        {/* Help Button & Menu */}
        <div className="fixed bottom-6 right-6 z-50">
          {/* Help Menu */}
          {showHelpMenu && (
            <div className="absolute bottom-16 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]">
              <button
                onClick={() => {
                  setShowHelpMenu(false);
                  startOnboarding();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <span>🎯</span>
                <span>Take Tour</span>
              </button>
              <button
                onClick={() => {
                  setShowHelpMenu(false);
                  setShowQuickTips(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <span>💡</span>
                <span>Quick Tips</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <span>📖</span>
                <span>Documentation</span>
              </a>
            </div>
          )}

          {/* Help Button */}
          <button
            onClick={() => setShowHelpMenu(!showHelpMenu)}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
            title="Help & Support"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Onboarding Tour */}
        {showOnboarding && (
          <OnboardingTour onComplete={completeOnboarding} />
        )}

        {/* Quick Tips */}
        {showQuickTips && (
          <QuickTips isOpen={showQuickTips} onClose={() => setShowQuickTips(false)} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;