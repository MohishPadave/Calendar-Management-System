import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from '@/components/primitives/Modal';
import Button from '@/components/primitives/Button';
import Select from '@/components/primitives/Select';
import ConflictWarning from './ConflictWarning';
import { 
  CalendarEvent, 
  EventFormData, 
  EVENT_COLORS, 
  EVENT_CATEGORIES 
} from './CalendarView.types';
import { validateEvent } from '@/utils/event.utils';
import { formatDate } from '@/utils/date.utils';
import { detectEventConflicts, ConflictInfo } from '@/utils/conflict.utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<CalendarEvent>) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  allEvents?: CalendarEvent[];
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  event,
  initialDate,
  allEvents = [],
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    color: EVENT_COLORS[0],
    category: EVENT_CATEGORIES[0],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(true);

  const isEditing = Boolean(event);
  const modalTitle = isEditing ? 'Edit Event' : 'Create Event';

  // Detect conflicts in real-time
  const conflictInfo: ConflictInfo = useMemo(() => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return { hasConflict: false, conflictingEvents: [], conflictMessage: '', suggestedTimes: [] };
    }

    return detectEventConflicts(
      {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        color: formData.color,
        category: formData.category,
      },
      allEvents,
      event?.id // Exclude current event when editing
    );
  }, [formData, allEvents, event?.id]);

  // Initialize form data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        color: event.color || EVENT_COLORS[0],
        category: event.category || EVENT_CATEGORIES[0],
      });
    } else if (initialDate && isOpen) {
      const start = new Date(initialDate);
      start.setHours(9, 0, 0, 0);
      const end = new Date(initialDate);
      end.setHours(10, 0, 0, 0);
      
      setFormData({
        title: '',
        description: '',
        startDate: start,
        endDate: end,
        color: EVENT_COLORS[0],
        category: EVENT_CATEGORIES[0],
      });
    }
    
    if (isOpen) {
      setErrors([]);
      setShowConflictWarning(true);
    }
  }, [event?.id, isOpen]);

  const handleInputChange = useCallback((
    field: keyof EventFormData,
    value: string | Date
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }, []);

  const handleSuggestedTimeSelect = useCallback((suggestedTime: Date) => {
    const duration = formData.endDate.getTime() - formData.startDate.getTime();
    const newEndTime = new Date(suggestedTime.getTime() + duration);
    
    setFormData(prev => ({
      ...prev,
      startDate: suggestedTime,
      endDate: newEndTime,
    }));
    setShowConflictWarning(false);
  }, [formData.startDate, formData.endDate]);

  const handleDateTimeChange = useCallback((
    field: 'startDate' | 'endDate',
    dateValue: string,
    timeValue: string
  ) => {
    const dateParts = dateValue.split('-');
    const timeParts = timeValue.split(':');
    
    const year = parseInt(dateParts[0] || '0', 10);
    const month = parseInt(dateParts[1] || '1', 10);
    const day = parseInt(dateParts[2] || '1', 10);
    const hours = parseInt(timeParts[0] || '0', 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    
    const newDate = new Date(year, month - 1, day, hours, minutes);
    
    setShowConflictWarning(true); // Show warning when time changes
    
    setFormData(prev => {
      const updated = { ...prev, [field]: newDate };
      
      // Auto-adjust end time if start time changes
      if (field === 'startDate' && updated.endDate <= newDate) {
        const newEndDate = new Date(newDate);
        newEndDate.setHours(newDate.getHours() + 1);
        updated.endDate = newEndDate;
      }
      
      return updated;
    });
    setErrors([]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateEvent(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditing && event && onUpdate) {
        await onUpdate(event.id, formData);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'An error occurred']);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isEditing, event, onUpdate, onSave, onClose]);

  const handleDelete = useCallback(async () => {
    if (!event || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      setIsLoading(true);
      try {
        await onDelete(event.id);
        onClose();
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Failed to delete event']);
      } finally {
        setIsLoading(false);
      }
    }
  }, [event, onDelete, onClose]);

  const colorOptions = EVENT_COLORS.map(color => ({
    value: color,
    label: color,
  }));

  const categoryOptions = EVENT_CATEGORIES.map(category => ({
    value: category,
    label: category,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Conflict Warning */}
        {showConflictWarning && conflictInfo.hasConflict && (
          <ConflictWarning
            conflictInfo={conflictInfo}
            onSelectSuggestedTime={handleSuggestedTimeSelect}
            onDismiss={() => setShowConflictWarning(false)}
          />
        )}

        {/* Title */}
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Title *
          </label>
          <input
            id="event-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-visible bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            placeholder="Enter event title"
            required
          />
          <div className="mt-1 text-xs text-neutral-500">
            {formData.title.length}/100 characters
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="event-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            id="event-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-visible resize-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            placeholder="Enter event description (optional)"
          />
          <div className="mt-1 text-xs text-neutral-500">
            {formData.description.length}/500 characters
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date/Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Start Date & Time *
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={formatDate(formData.startDate, 'yyyy-MM-dd')}
                onChange={(e) => handleDateTimeChange(
                  'startDate',
                  e.target.value,
                  formatDate(formData.startDate, 'HH:mm')
                )}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-visible bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                required
              />
              <input
                type="time"
                value={formatDate(formData.startDate, 'HH:mm')}
                onChange={(e) => handleDateTimeChange(
                  'startDate',
                  formatDate(formData.startDate, 'yyyy-MM-dd'),
                  e.target.value
                )}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-visible bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
          </div>

          {/* End Date/Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              End Date & Time *
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={formatDate(formData.endDate, 'yyyy-MM-dd')}
                onChange={(e) => handleDateTimeChange(
                  'endDate',
                  e.target.value,
                  formatDate(formData.endDate, 'HH:mm')
                )}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-visible bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                required
              />
              <input
                type="time"
                value={formatDate(formData.endDate, 'HH:mm')}
                onChange={(e) => handleDateTimeChange(
                  'endDate',
                  formatDate(formData.endDate, 'yyyy-MM-dd'),
                  e.target.value
                )}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-visible bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
          </div>
        </div>

        {/* Color and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? 'border-neutral-900 scale-110' 
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange('color', color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Category
            </label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              aria-label="Event category"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-neutral-200">
          <div>
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete Event
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isEditing ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EventModal;