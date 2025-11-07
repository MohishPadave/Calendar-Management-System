import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import CalendarCell from './CalendarCell';
import { CalendarEvent } from './CalendarView.types';
import { 
  getMonthDays, 
  isDateInCurrentMonth, 
  isDateSame,
  formatDate 
} from '@/utils/date.utils';
import { filterEventsByDate } from '@/utils/event.utils';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  focusedCell: { row: number; col: number } | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCellFocus: (row: number, col: number) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MonthView: React.FC<MonthViewProps> = memo(({
  currentDate,
  events,
  selectedDate,
  focusedCell,
  onDateClick,
  onEventClick,
  onCellFocus,
}) => {
  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);
  
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    
    monthDays.forEach(date => {
      const dayEvents = filterEventsByDate(events, date);
      grouped.set(date.toDateString(), dayEvents);
    });
    
    return grouped;
  }, [events, monthDays]);

  const handleCellFocus = useCallback((row: number, col: number) => {
    onCellFocus(row, col);
  }, [onCellFocus]);

  const renderWeekHeader = () => (
    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
      {WEEKDAYS.map((day) => (
        <div
          key={day}
          className="py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider"
        >
          {day}
        </div>
      ))}
    </div>
  );

  const renderCalendarGrid = () => {
    const weeks: Date[][] = [];
    
    // Group days into weeks (6 rows × 7 columns = 42 cells)
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7));
    }

    return (
      <div className="grid grid-rows-6 flex-1 min-h-[600px]">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 min-h-[100px]">
            {week.map((date, dayIndex) => {
              const dateKey = date.toDateString();
              const dayEvents = eventsByDate.get(dateKey) || [];
              const isSelected = selectedDate ? isDateSame(date, selectedDate) : false;
              const isFocused = focusedCell?.row === weekIndex && focusedCell?.col === dayIndex;

              return (
                <CalendarCell
                  key={dateKey}
                  date={date}
                  currentMonth={currentDate}
                  events={dayEvents}
                  selectedDate={selectedDate}
                  isSelected={isSelected}
                  isFocused={isFocused}
                  onDateClick={onDateClick}
                  onEventClick={onEventClick}
                  onCellFocus={() => handleCellFocus(weekIndex, dayIndex)}
                  allEvents={events}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="flex flex-col min-h-full bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderWeekHeader()}
      {renderCalendarGrid()}
    </motion.div>
  );
});

MonthView.displayName = 'MonthView';

export default MonthView;