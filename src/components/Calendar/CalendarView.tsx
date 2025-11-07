import React, { useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import MonthView from './MonthView';
import WeekView from './WeekView';
import YearView from './YearView';
import SimpleEventModal from './SimpleEventModal';
import Sidebar from './Sidebar';
import ThemeToggle from '@/components/primitives/ThemeToggle';
import { CalendarViewProps, CalendarEvent } from './CalendarView.types';
import { useCalendar } from '@/hooks/useCalendar';
import { useEventManager } from '@/hooks/useEventManager';
import { formatDate, getToday } from '@/utils/date.utils';

const CalendarView: React.FC<CalendarViewProps> = ({
  events: externalEvents,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialView = 'month',
  initialDate = getToday(),
}) => {
  const calendar = useCalendar({ initialView, initialDate });
  const eventManager = useEventManager({
    initialEvents: externalEvents,
  });

  // Sync external events with internal event manager
  useEffect(() => {
    if (externalEvents) {
      eventManager.setEvents(externalEvents);
    }
  }, [externalEvents, eventManager.setEvents]);

  const handleDateClick = useCallback((date: Date) => {
    calendar.selectDate(date);
    calendar.openEventModal();
  }, [calendar]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    calendar.selectEvent(event);
    calendar.openEventModal(event);
  }, [calendar]);

  const handleEventSave = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent = eventManager.addEvent(eventData);
      onEventAdd?.(newEvent);
      calendar.closeEventModal();
      return newEvent;
    } catch (error) {
      throw error; // Let EventModal handle the error display
    }
  }, [eventManager, calendar, onEventAdd]);

  const handleEventUpdate = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      eventManager.updateEvent(id, updates);
      onEventUpdate?.(id, updates);
      calendar.closeEventModal();
    } catch (error) {
      throw error;
    }
  }, [eventManager, calendar, onEventUpdate]);

  const handleEventDelete = useCallback(async (id: string) => {
    eventManager.deleteEvent(id);
    onEventDelete?.(id);
    calendar.closeEventModal();
  }, [eventManager, calendar, onEventDelete]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (calendar.isEventModalOpen) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        calendar.moveFocus('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        calendar.moveFocus('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        calendar.moveFocus('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        calendar.moveFocus('right');
        break;
      case 'Enter':
        event.preventDefault();
        if (calendar.focusedCell && calendar.visibleDays.length > 0) {
          const { row, col } = calendar.focusedCell;
          const cellIndex = row * 7 + col;
          const selectedDate = calendar.visibleDays[cellIndex];
          if (selectedDate) {
            handleDateClick(selectedDate);
          }
        }
        break;
      case 'Escape':
        calendar.setFocusedCell(null);
        break;
    }
  }, [calendar, handleDateClick]);

  const monthOptions = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(calendar.currentDate.getFullYear(), i, 1);
      months.push({
        value: i.toString(),
        label: formatDate(date, 'MMMM'),
      });
    }
    return months;
  }, [calendar.currentDate]);

  const yearOptions = useMemo(() => {
    const currentYear = calendar.currentDate.getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push({
        value: i.toString(),
        label: i.toString(),
      });
    }
    return years;
  }, [calendar.currentDate]);

  const handleMonthChange = useCallback((monthStr: string) => {
    const month = parseInt(monthStr, 10);
    const newDate = new Date(calendar.currentDate);
    newDate.setMonth(month);
    calendar.setCurrentDate(newDate);
  }, [calendar]);

  const handleYearChange = useCallback((yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const newDate = new Date(calendar.currentDate);
    newDate.setFullYear(year);
    calendar.setCurrentDate(newDate);
  }, [calendar]);

  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const headerVariants: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const contentVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="flex min-h-screen w-full bg-white dark:bg-[#1f1f1f] transition-colors duration-300"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Calendar application"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Sidebar */}
      <div data-tour="sidebar">
        <Sidebar
          currentDate={calendar.currentDate}
          events={eventManager.allEvents}
          onDateSelect={(date) => {
            calendar.setCurrentDate(date);
            calendar.selectDate(date);
          }}
          onCreateEvent={() => calendar.openEventModal()}
          onTimeSlotSelect={(slot) => {
            calendar.selectDate(slot.start);
            calendar.openEventModal();
          }}
          onCreateEventWithTime={(startTime, endTime) => {
            const eventData = {
              title: 'New Event',
              description: '',
              startDate: startTime,
              endDate: endTime,
              color: '#3b82f6',
              category: 'Work',
            };
            handleEventSave(eventData);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0"
          variants={headerVariants}
        >
        {/* Navigation */}
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.div 
            className="flex items-center space-x-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            data-tour="navigation"
          >
            <button
              onClick={() => calendar.navigate('prev')}
              aria-label={`Previous ${calendar.view}`}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg 
                className="w-5 h-5 text-gray-700 dark:text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => calendar.navigate('next')}
              aria-label={`Next ${calendar.view}`}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg 
                className="w-5 h-5 text-gray-700 dark:text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <button
              onClick={calendar.goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Today
            </button>
          </motion.div>

          {/* Current Date Display */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <h1 className="text-xl font-normal text-gray-700 dark:text-gray-200">
              {formatDate(calendar.currentDate, 'MMMM yyyy')}
            </h1>
          </motion.div>
        </motion.div>

        {/* View Toggle and Actions */}
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {/* Theme Toggle */}
          <div data-tour="theme-toggle">
            <ThemeToggle />
          </div>

          {/* View Dropdown */}
          <div className="relative" data-tour="view-selector">
            <select
              value={calendar.view}
              onChange={(e) => calendar.setView(e.target.value as any)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="year">Year</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>
      </motion.div>



        {/* Calendar Content */}
        <motion.div 
          className="flex-1 min-h-[600px] px-6 py-4"
          variants={contentVariants}
        >
          <AnimatePresence mode="wait">
            {calendar.view === 'month' ? (
              <motion.div
                key="month"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <MonthView
                  currentDate={calendar.currentDate}
                  events={eventManager.allEvents}
                  selectedDate={calendar.selectedDate}
                  focusedCell={calendar.focusedCell}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  onCellFocus={(row, col) => calendar.setFocusedCell({ row, col })}
                />
              </motion.div>
            ) : calendar.view === 'week' ? (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <WeekView
                  currentDate={calendar.currentDate}
                  events={eventManager.allEvents}
                  selectedDate={calendar.selectedDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleDateClick}
                />
              </motion.div>
            ) : (
              <motion.div
                key="year"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <YearView
                  currentDate={calendar.currentDate}
                  events={eventManager.allEvents}
                  selectedDate={calendar.selectedDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  onMonthClick={(date) => {
                    calendar.setCurrentDate(date);
                    calendar.setView('month');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Event Modal */}
      <SimpleEventModal
        isOpen={calendar.isEventModalOpen}
        onClose={calendar.closeEventModal}
        onSave={handleEventSave}
        onUpdate={handleEventUpdate}
        onDelete={handleEventDelete}
        event={calendar.selectedEvent}
        initialDate={calendar.selectedDate ?? new Date()}
      />
    </motion.div>
  );
};

export default CalendarView;