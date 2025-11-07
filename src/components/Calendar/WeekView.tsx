import React, { memo, useCallback, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from './CalendarView.types';
import { 
  getWeekDays, 
  getTimeSlots, 
  getEventPosition, 
  formatDate,
  isDateToday,
  createDateFromTimeString 
} from '@/utils/date.utils';
import { 
  filterEventsByDate, 
  calculateEventLayout,
  LayoutEvent
} from '@/utils/event.utils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

const HOUR_HEIGHT = 60; // pixels per hour
const INTERVAL_MINUTES = 60;

const WeekView: React.FC<WeekViewProps> = memo(({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
  onTimeSlotClick,
}) => {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const weekContainerRef = useRef<HTMLDivElement>(null);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const timeSlots = useMemo(() => getTimeSlots(INTERVAL_MINUTES), []);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, LayoutEvent[]>();
    
    weekDays.forEach(date => {
      const dayEvents = filterEventsByDate(events, date);
      const layoutEvents = calculateEventLayout(dayEvents);
      grouped.set(date.toDateString(), layoutEvents);
    });
    
    return grouped;
  }, [events, weekDays]);

  const handleTimeSlotClick = useCallback((date: Date, timeSlot: string) => {
    const clickedDateTime = createDateFromTimeString(date, timeSlot);
    onTimeSlotClick?.(clickedDateTime, timeSlot);
  }, [onTimeSlotClick]);

  const handleEventMouseDown = useCallback((
    event: React.MouseEvent,
    calendarEvent: CalendarEvent
  ) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setDraggedEvent(calendarEvent);
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!draggedEvent || !weekContainerRef.current) return;

    // Update dragged event position (visual feedback only)
    // In a real implementation, you'd update the event position
    // and handle collision detection with time slots
  }, [draggedEvent]);

  const handleMouseUp = useCallback(() => {
    if (draggedEvent) {
      // In a real implementation, you'd calculate the new time
      // based on the drop position and update the event
      setDraggedEvent(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [draggedEvent]);

  const renderTimeColumn = () => (
    <div className="w-16 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-700" /> {/* Header spacer */}
      {timeSlots.map((time) => (
        <div
          key={time}
          className="h-15 border-b border-neutral-100 dark:border-neutral-700 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 text-right"
          style={{ height: HOUR_HEIGHT }}
        >
          {time}
        </div>
      ))}
    </div>
  );

  const renderDayColumn = (date: Date, dayIndex: number) => {
    const dayEvents = eventsByDay.get(date.toDateString()) || [];
    const isToday = isDateToday(date);
    const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;

    return (
      <div key={date.toDateString()} className="flex-1 border-r border-neutral-200 dark:border-neutral-700 last:border-r-0">
        {/* Day header */}
        <div 
          className={`
            h-12 border-b border-neutral-200 dark:border-neutral-700 p-2 cursor-pointer transition-colors
            ${isToday 
              ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700' 
              : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }
            ${isSelected ? 'bg-primary-100 dark:bg-primary-800/50' : ''}
          `}
          onClick={() => onDateClick(date)}
        >
          <div className="text-center">
            <div className="text-xs text-neutral-600 dark:text-neutral-400 uppercase">
              {formatDate(date, 'EEE')}
            </div>
            <div 
              className={`
                text-sm font-semibold mt-1
                ${isToday 
                  ? 'bg-primary-600 dark:bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' 
                  : 'text-neutral-900 dark:text-neutral-100'
                }
              `}
            >
              {formatDate(date, 'd')}
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div className="relative bg-white dark:bg-neutral-800">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="border-b border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
              style={{ height: HOUR_HEIGHT }}
              onClick={() => handleTimeSlotClick(date, time)}
            />
          ))}

          {/* Events */}
          {dayEvents.map((event) => {
            const position = getEventPosition(
              event.startDate,
              event.endDate,
              date,
              HOUR_HEIGHT,
              INTERVAL_MINUTES
            );

            return (
              <motion.div
                key={event.id}
                className="absolute inset-x-1 rounded-md shadow-sm cursor-pointer overflow-hidden"
                style={{
                  top: position.top,
                  height: position.height,
                  backgroundColor: event.color,
                  width: `${event.width}%`,
                  left: `${event.left}%`,
                  zIndex: 10,
                }}
                onMouseDown={(e) => handleEventMouseDown(e, event)}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-1 h-full overflow-hidden">
                  <div className="text-white text-xs font-medium truncate">
                    {event.title}
                  </div>
                  <div className="text-white text-xs opacity-90 truncate">
                    {formatDate(event.startDate, 'HH:mm')} - {formatDate(event.endDate, 'HH:mm')}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="flex flex-col min-h-full bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        ref={weekContainerRef}
        className="flex flex-1 overflow-auto scrollbar-thin bg-white dark:bg-neutral-800"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderTimeColumn()}
        {weekDays.map((date, index) => renderDayColumn(date, index))}
      </div>
    </motion.div>
  );
});

WeekView.displayName = 'WeekView';

export default WeekView;