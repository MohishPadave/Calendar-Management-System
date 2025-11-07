import { useState, useCallback, useMemo } from 'react';
import { CalendarState, CalendarView, CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { 
  getToday, 
  navigateMonth, 
  navigateWeek, 
  navigateYear,
  getMonthDays, 
  getWeekDays 
} from '@/utils/date.utils';

interface UseCalendarProps {
  initialView?: CalendarView;
  initialDate?: Date;
}

export const useCalendar = ({ 
  initialView = 'month', 
  initialDate = getToday() 
}: UseCalendarProps = {}) => {
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    view: initialView,
    selectedDate: null,
    selectedEvent: null,
    isEventModalOpen: false,
    focusedCell: null,
  });

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setState(prev => ({
      ...prev,
      currentDate: prev.view === 'month' 
        ? navigateMonth(prev.currentDate, direction)
        : prev.view === 'week'
        ? navigateWeek(prev.currentDate, direction)
        : navigateYear(prev.currentDate, direction),
    }));
  }, []);

  const goToToday = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: getToday(),
    }));
  }, []);

  const setView = useCallback((view: CalendarView) => {
    setState(prev => ({
      ...prev,
      view,
    }));
  }, []);

  const setCurrentDate = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      currentDate: date,
    }));
  }, []);

  const selectDate = useCallback((date: Date | null) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
    }));
  }, []);

  const selectEvent = useCallback((event: CalendarEvent | null) => {
    setState(prev => ({
      ...prev,
      selectedEvent: event,
    }));
  }, []);

  const openEventModal = useCallback((event?: CalendarEvent) => {
    setState(prev => ({
      ...prev,
      selectedEvent: event || null,
      isEventModalOpen: true,
    }));
  }, []);

  const closeEventModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedEvent: null,
      isEventModalOpen: false,
    }));
  }, []);

  const setFocusedCell = useCallback((cell: { row: number; col: number } | null) => {
    setState(prev => ({
      ...prev,
      focusedCell: cell,
    }));
  }, []);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setState(prev => {
      if (!prev.focusedCell) return prev;

      const { row, col } = prev.focusedCell;
      let newRow = row;
      let newCol = col;

      switch (direction) {
        case 'up':
          newRow = Math.max(0, row - 1);
          break;
        case 'down':
          newRow = Math.min(5, row + 1); // 6 rows max
          break;
        case 'left':
          newCol = Math.max(0, col - 1);
          break;
        case 'right':
          newCol = Math.min(6, col + 1); // 7 columns max
          break;
      }

      return {
        ...prev,
        focusedCell: { row: newRow, col: newCol },
      };
    });
  }, []);

  const visibleDays = useMemo(() => {
    if (state.view === 'month') {
      return getMonthDays(state.currentDate);
    } else if (state.view === 'week') {
      return getWeekDays(state.currentDate);
    } else {
      // For year view, return empty array as we don't need visible days
      return [];
    }
  }, [state.currentDate, state.view]);

  return {
    // State
    currentDate: state.currentDate,
    view: state.view,
    selectedDate: state.selectedDate,
    selectedEvent: state.selectedEvent,
    isEventModalOpen: state.isEventModalOpen,
    focusedCell: state.focusedCell,
    visibleDays,

    // Actions
    navigate,
    goToToday,
    setView,
    setCurrentDate,
    selectDate,
    selectEvent,
    openEventModal,
    closeEventModal,
    setFocusedCell,
    moveFocus,
  };
};