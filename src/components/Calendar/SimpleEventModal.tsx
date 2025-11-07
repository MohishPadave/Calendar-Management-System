import React, { useState, useEffect } from 'react';
import { CalendarEvent, EVENT_COLORS } from './CalendarView.types';

interface SimpleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<CalendarEvent>) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

const SimpleEventModal: React.FC<SimpleEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  event,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const isEditing = Boolean(event);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Editing existing event
        setTitle(event.title);
        setDescription(event.description || '');
        setStartDate(event.startDate.toISOString().split('T')[0] || '');
        setStartTime(event.startDate.toTimeString().slice(0, 5) || '');
        setEndDate(event.endDate.toISOString().split('T')[0] || '');
        setEndTime(event.endDate.toTimeString().slice(0, 5) || '');
        setColor(event.color || '#3b82f6');
      } else if (initialDate) {
        // Creating new event
        const start = new Date(initialDate);
        start.setHours(9, 0, 0, 0);
        const end = new Date(initialDate);
        end.setHours(10, 0, 0, 0);
        
        setTitle('');
        setDescription('');
        setStartDate(start.toISOString().split('T')[0] || '');
        setStartTime('09:00');
        setEndDate(end.toISOString().split('T')[0] || '');
        setEndTime('10:00');
        setColor('#3b82f6');
      }
    }
  }, [isOpen, event, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      startDate: startDateTime,
      endDate: endDateTime,
      color,
      category: 'General',
    };

    if (isEditing && event && onUpdate) {
      onUpdate(event.id, eventData);
    } else {
      onSave(eventData);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {EVENT_COLORS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`
                      relative w-10 h-10 rounded-full transition-all duration-200 
                      hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                      ${color === colorOption 
                        ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110 shadow-lg' 
                        : 'hover:shadow-md'
                      }
                    `}
                    style={{ backgroundColor: colorOption }}
                    aria-label={`Select color ${colorOption}`}
                  >
                    {color === colorOption && (
                      <svg 
                        className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </button>
                ))}
                
                {/* Custom color picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
                    aria-label="Custom color picker"
                  />
                  <div 
                    className={`
                      w-10 h-10 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500
                      flex items-center justify-center cursor-pointer transition-all duration-200
                      hover:scale-110 hover:border-gray-600 dark:hover:border-gray-300
                      ${!EVENT_COLORS.includes(color as any) 
                        ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110' 
                        : ''
                      }
                    `}
                    style={{ 
                      backgroundColor: !EVENT_COLORS.includes(color as any) ? color : 'transparent' 
                    }}
                  >
                    {EVENT_COLORS.includes(color as any) && (
                      <svg 
                        className="w-5 h-5 text-gray-500 dark:text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 4v16m8-8H4" 
                        />
                      </svg>
                    )}
                    {!EVENT_COLORS.includes(color as any) && (
                      <svg 
                        className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Click the + button for custom colors
              </p>
            </div>

            <div className="flex justify-between pt-4">
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              )}
              
              <div className="flex space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleEventModal;