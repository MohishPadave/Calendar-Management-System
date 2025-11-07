import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from './CalendarView.types';
import { formatDate } from '@/utils/date.utils';
import { findFreeTimeSlots } from '@/utils/conflict.utils';

interface SidebarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  onTimeSlotSelect?: (slot: { start: Date; end: Date }) => void;
  onCreateEventWithTime?: (startTime: Date, endTime: Date) => void;
}

interface FreeTimeFinderContentProps {
  show: boolean;
  events: CalendarEvent[];
  currentDate: Date;
  onTimeSlotSelect?: (slot: { start: Date; end: Date }) => void;
}

const FreeTimeFinderContent: React.FC<FreeTimeFinderContentProps> = ({
  show,
  events,
  currentDate,
  onTimeSlotSelect,
}) => {
  const freeTimeResult = useMemo(() => {
    if (!show) return null;
    return findFreeTimeSlots(events, currentDate);
  }, [show, events, currentDate]);

  if (!show || !freeTimeResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 space-y-2"
    >
      {/* Next Available Hour */}
      {freeTimeResult.nextAvailableHour && (
        <button
          onClick={() => {
            if (onTimeSlotSelect && freeTimeResult.nextAvailableHour) {
              onTimeSlotSelect(freeTimeResult.nextAvailableHour);
            }
          }}
          className="w-full p-2 text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
              Next Hour
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 truncate">
            {new Date(freeTimeResult.nextAvailableHour.start).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })} - {new Date(freeTimeResult.nextAvailableHour.end).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </button>
      )}

      {/* Longest Free Block */}
      {freeTimeResult.longestFreeBlock && (
        <button
          onClick={() => {
            if (onTimeSlotSelect && freeTimeResult.longestFreeBlock) {
              onTimeSlotSelect(freeTimeResult.longestFreeBlock);
            }
          }}
          className="w-full p-2 text-left bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">⏰</span>
            <span className="text-xs font-medium text-green-800 dark:text-green-200">
              Longest Block
            </span>
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 truncate">
            {new Date(freeTimeResult.longestFreeBlock.start).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })} - {new Date(freeTimeResult.longestFreeBlock.end).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
            {Math.floor(freeTimeResult.longestFreeBlock.duration / 60)}h {freeTimeResult.longestFreeBlock.duration % 60}m
          </div>
        </button>
      )}

      {/* All Free Slots */}
      {freeTimeResult.allFreeSlots.length > 0 && (
        <div className="pt-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">
            All Free Slots ({freeTimeResult.allFreeSlots.length})
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {freeTimeResult.allFreeSlots.slice(0, 5).map((slot: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  if (onTimeSlotSelect) {
                    onTimeSlotSelect(slot);
                  }
                }}
                className="w-full p-2 text-left bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {new Date(slot.start).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })} - {new Date(slot.end).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {Math.floor(slot.duration / 60)}h {slot.duration % 60}m
                </div>
              </button>
            ))}
            {freeTimeResult.allFreeSlots.length > 5 && (
              <div className="text-xs text-gray-500 dark:text-gray-500 text-center py-1">
                +{freeTimeResult.allFreeSlots.length - 5} more slots
              </div>
            )}
          </div>
        </div>
      )}

      {freeTimeResult.allFreeSlots.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-500">
          <div className="text-2xl mb-1">📅</div>
          <p className="text-xs">No free slots today</p>
        </div>
      )}
    </motion.div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentDate,
  events,
  onDateSelect,
  onCreateEvent,
  onTimeSlotSelect,
  onCreateEventWithTime,
}) => {
  const [showFreeTimeFinder, setShowFreeTimeFinder] = useState(false);

  // Generate mini calendar for current month
  const generateMiniCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const miniCalendarDays = generateMiniCalendar();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const c = new Date(currentDate);
    c.setHours(0, 0, 0, 0);
    return d.getTime() === c.getTime();
  };

  return (
    <div className="w-64 bg-white dark:bg-[#1f1f1f] border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-y-auto hidden md:flex">
      {/* Create Button */}
      <div className="p-4">
        <button
          onClick={onCreateEvent}
          className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2d2d2d] border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-[#3d3d3d] transition-all"
          data-tour="create-button"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="px-4 pb-4" data-tour="mini-calendar">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {formatDate(currentDate, 'MMMM yyyy')}
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {miniCalendarDays.map((date, i) => {
            const hasEvents = events.some(event => {
              const eventDate = new Date(event.startDate);
              eventDate.setHours(0, 0, 0, 0);
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              return eventDate.getTime() === d.getTime();
            });

            return (
              <button
                key={i}
                onClick={() => onDateSelect(date)}
                className={`
                  aspect-square flex items-center justify-center text-xs rounded-full transition-colors
                  ${!isCurrentMonth(date) 
                    ? 'text-gray-400 dark:text-gray-600' 
                    : 'text-gray-700 dark:text-gray-300'
                  }
                  ${isToday(date) 
                    ? 'bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] font-medium' 
                    : isSelected(date)
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="relative">
                  {date.getDate()}
                  {hasEvents && !isToday(date) && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1a73e8] dark:bg-[#8ab4f8] rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Features Section */}
      <div className="flex-1 px-4 py-4 space-y-2">
        {/* Free Time Finder Toggle */}
        <button
          onClick={() => setShowFreeTimeFinder(!showFreeTimeFinder)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          data-tour="free-time-finder"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Free Time Finder
          </div>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${showFreeTimeFinder ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Free Time Finder Content */}
        {onTimeSlotSelect && (
          <FreeTimeFinderContent
            show={showFreeTimeFinder}
            events={events}
            currentDate={currentDate}
            onTimeSlotSelect={onTimeSlotSelect}
          />
        )}

        {/* Event Statistics */}
        <div className="pt-4" data-tour="statistics">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
            Statistics
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#2d2d2d] rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{events.length}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#2d2d2d] rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {events.filter(e => {
                  const eventDate = new Date(e.startDate);
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="pt-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
            Categories
          </div>
          <div className="space-y-1">
            {Array.from(new Set(events.map(e => e.category))).map(category => {
              const count = events.filter(e => e.category === category).length;
              return (
                <div key={category} className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
