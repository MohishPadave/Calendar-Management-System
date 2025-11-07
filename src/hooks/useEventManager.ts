import { useState, useCallback, useMemo } from 'react';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { 
  createEvent, 
  updateEvent, 
  validateEvent, 
  filterEventsByDateRange,
  groupEventsByDate,
  searchEvents,
  getEventsByCategory,
} from '@/utils/event.utils';

interface UseEventManagerProps {
  initialEvents?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (id: string, updates: Partial<CalendarEvent>) => void;
  onEventDelete?: (id: string) => void;
}

export const useEventManager = ({
  initialEvents = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: UseEventManagerProps = {}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const errors = validateEvent(eventData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const newEvent = createEvent(eventData);
    
    setEvents(prev => [...prev, newEvent]);
    onEventAdd?.(newEvent);
    
    return newEvent;
  }, [onEventAdd]);

  const updateEventById = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    let updatedEvent: CalendarEvent | null = null;
    
    setEvents(prev => {
      const eventIndex = prev.findIndex(e => e.id === id);
      if (eventIndex === -1) return prev;

      const currentEvent = prev[eventIndex];
      if (!currentEvent) return prev;
      
      const updatedEventData = { ...currentEvent, ...updates };
      
      const errors = validateEvent(updatedEventData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      updatedEvent = updateEvent(currentEvent, updates);
      const newEvents = [...prev];
      newEvents[eventIndex] = updatedEvent;
      
      return newEvents;
    });
    
    // Call the callback after state update
    if (updatedEvent) {
      onEventUpdate?.(id, updates);
    }
  }, [onEventUpdate]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    onEventDelete?.(id);
  }, [onEventDelete]);

  const setEventsData = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  }, []);

  const getEvent = useCallback((id: string): CalendarEvent | undefined => {
    return events.find(e => e.id === id);
  }, [events]);

  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date): CalendarEvent[] => {
    return filterEventsByDateRange(events, startDate, endDate);
  }, [events]);

  const getEventsGroupedByDate = useCallback((startDate: Date, endDate: Date) => {
    const rangeEvents = filterEventsByDateRange(events, startDate, endDate);
    return groupEventsByDate(rangeEvents);
  }, [events]);

  // Filtered events based on search and category
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      filtered = searchEvents(filtered, searchQuery);
    }

    if (selectedCategory) {
      filtered = getEventsByCategory(filtered, selectedCategory);
    }

    return filtered;
  }, [events, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const categorySet = new Set(events.map(e => e.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [events]);

  const eventCount = useMemo(() => events.length, [events]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
  }, []);

  return {
    // State
    events: filteredEvents,
    allEvents: events,
    searchQuery,
    selectedCategory,
    categories,
    eventCount,

    // Actions
    addEvent,
    updateEvent: updateEventById,
    deleteEvent,
    getEvent,
    getEventsForDateRange,
    getEventsGroupedByDate,
    setSearchQuery,
    setSelectedCategory,
    clearFilters,

    // Bulk operations
    setEvents: setEventsData,
  };
};