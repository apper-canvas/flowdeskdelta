import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import { meetingService } from '@/services';
import { formatDateTime } from '@/utils/helpers';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipData, setTooltipData] = useState({ visible: false, x: 0, y: 0, meeting: null });
  const [theme, setTheme] = useState('default');
  const tooltipRef = useRef(null);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    attendees: '',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    location: '',
    type: 'meeting',
    priority: 'medium'
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingService.getAll();
      setMeetings(data);
    } catch (err) {
      setError('Failed to load meetings');
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    setEditingMeeting(null);
    setMeetingForm({
      title: '',
      description: '',
      attendees: '',
      start: new Date(),
      end: new Date(Date.now() + 3600000),
      location: '',
      type: 'meeting',
      priority: 'medium'
    });
    setShowMeetingModal(true);
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setMeetingForm({
      title: meeting.title,
      description: meeting.description,
      attendees: Array.isArray(meeting.attendees) ? meeting.attendees.join(', ') : meeting.attendees,
      start: new Date(meeting.start),
      end: new Date(meeting.end),
      location: meeting.location || '',
      type: meeting.type || 'meeting',
      priority: meeting.priority || 'medium'
    });
    setShowMeetingModal(true);
  };

  const handleSaveMeeting = async () => {
    try {
      if (!meetingForm.title.trim()) {
        toast.error('Meeting title is required');
        return;
      }

      if (meetingForm.start >= meetingForm.end) {
        toast.error('End time must be after start time');
        return;
      }

      const meetingData = {
        ...meetingForm,
        attendees: meetingForm.attendees.split(',').map(email => email.trim()).filter(email => email),
        start: meetingForm.start.toISOString(),
        end: meetingForm.end.toISOString()
      };

      if (editingMeeting) {
        await meetingService.update(editingMeeting.id, meetingData);
        toast.success('Meeting updated successfully');
      } else {
        await meetingService.create(meetingData);
        toast.success('Meeting created successfully');
      }

      setShowMeetingModal(false);
      loadMeetings();
    } catch (err) {
      toast.error('Failed to save meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await meetingService.delete(meetingId);
      toast.success('Meeting deleted successfully');
      loadMeetings();
    } catch (err) {
      toast.error('Failed to delete meeting');
    }
  };

// Memoized functions for performance
  const getDateMeetings = useCallback((date) => {
    const dateStr = date.toDateString();
    return meetings.filter(meeting => 
      new Date(meeting.start).toDateString() === dateStr
    );
  }, [meetings]);

  const sortedMeetingsForDate = useMemo(() => {
    return getDateMeetings(selectedDate)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [getDateMeetings, selectedDate]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (showMeetingModal) return;
    
    const currentDate = new Date(selectedDate);
    let newDate = new Date(currentDate);
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() - 1);
        setSelectedDate(newDate);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() + 1);
        setSelectedDate(newDate);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() - 7);
        setSelectedDate(newDate);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() + 7);
        setSelectedDate(newDate);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCreateMeeting();
        break;
      case 'Escape':
        if (isSidebarOpen) setIsSidebarOpen(false);
        break;
    }
  }, [selectedDate, showMeetingModal, isSidebarOpen]);

  // Tooltip handlers
  const handleMeetingHover = useCallback((e, meeting) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      meeting
    });
  }, []);

  const handleMeetingLeave = useCallback(() => {
    setTooltipData(prev => ({ ...prev, visible: false }));
  }, []);

  // Theme variants
  const themeConfig = {
    default: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      surface: 'bg-white'
    },
    dark: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-700',
      surface: 'bg-gray-900'
    },
    colorful: {
      primary: 'bg-gradient-to-r from-purple-500 to-pink-500',
      secondary: 'bg-gradient-to-r from-blue-500 to-teal-500',
      surface: 'bg-gradient-to-br from-purple-50 to-pink-50'
    }
  };

  const currentTheme = themeConfig[theme];

  const renderCalendarCell = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dayMeetings = getDateMeetings(date);
    if (dayMeetings.length === 0) return null;

    return (
      <div className="calendar-event-indicator">
        {dayMeetings.slice(0, 3).map((meeting, index) => (
          <div
            key={meeting.id}
            className={`calendar-event-dot ${
              meeting.priority === 'high' ? 'bg-red-500' :
              meeting.priority === 'medium' ? 'bg-yellow-500' : 'bg-primary'
            }`}
            style={{ zIndex: dayMeetings.length - index }}
          />
        ))}
        {dayMeetings.length > 3 && (
          <div className="calendar-event-dot bg-gray-400" />
        )}
      </div>
    );
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const priorityColors = {
    high: 'bg-error/10 text-error border-error/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-accent/10 text-accent border-accent/20'
  };

  const typeIcons = {
    meeting: 'Users',
    client_meeting: 'Briefcase',
    presentation: 'Monitor',
    follow_up: 'Phone',
    conference: 'Video'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <p className="text-error font-medium mb-2">Error loading calendar</p>
          <button
            onClick={loadMeetings}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
      role="main"
      aria-label="Calendar application"
    >
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Schedule and manage your meetings</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="theme-selector" className="sr-only">Select theme</label>
              <select
                id="theme-selector"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Calendar theme"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="colorful">Colorful</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Calendar view modes">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 capitalize focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    viewMode === mode
                      ? 'bg-white text-primary shadow-sm transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  role="tab"
                  aria-selected={viewMode === mode}
                  aria-controls="calendar-content"
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <ApperIcon name={isSidebarOpen ? 'X' : 'Menu'} size={20} />
            </button>

            {/* New Meeting Button */}
            <button
              onClick={handleCreateMeeting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
              aria-label="Create new meeting"
            >
              <ApperIcon name="Plus" size={16} />
              <span className="hidden sm:inline">New Meeting</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Calendar */}
        <main 
          className="flex-1 p-4 sm:p-6" 
          id="calendar-content"
          role="tabpanel"
          aria-labelledby="calendar-heading"
        >
          <div className={`${currentTheme.surface} rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden`}>
            <div className="p-4 sm:p-6 h-full">
              <div className="h-full flex flex-col">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <h2 id="calendar-heading" className="text-lg font-heading font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="Previous month"
                    >
                      <ApperIcon name="ChevronLeft" size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="Go to today"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="Next month"
                    >
                      <ApperIcon name="ChevronRight" size={16} />
                    </button>
                  </div>
                </div>

                {/* Calendar Widget */}
                <div className="flex-1 flex items-center justify-center">
                  <DatePicker
                    selected={selectedDate}
                    onChange={setSelectedDate}
                    inline
                    calendarClassName="w-full max-w-md"
                    dayClassName={(date) => {
                      const dayMeetings = getDateMeetings(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      
                      return `relative transition-all duration-200 ${
                        dayMeetings.length > 0 ? 'has-meetings' : ''
                      } ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`;
                    }}
                    renderDayContents={(day, date) => (
                      <div 
                        className="relative w-full h-full flex items-center justify-center group"
                        onMouseEnter={(e) => {
                          const dayMeetings = getDateMeetings(date);
                          if (dayMeetings.length > 0) {
                            handleMeetingHover(e, dayMeetings[0]);
                          }
                        }}
                        onMouseLeave={handleMeetingLeave}
                      >
                        <span className="relative z-10">{day}</span>
                        {renderCalendarCell({ date, view: 'month' })}
                        
                        {/* Accessibility info for screen readers */}
                        {getDateMeetings(date).length > 0 && (
                          <span className="sr-only">
                            {getDateMeetings(date).length} meeting{getDateMeetings(date).length !== 1 ? 's' : ''} scheduled
                          </span>
                        )}
                      </div>
                    )}
                    onKeyDown={(e) => {
                      // Allow native DatePicker keyboard navigation
                      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

{/* Enhanced Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 768) && (
            <motion.aside
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 border-l border-gray-200 bg-white flex-shrink-0 absolute md:relative right-0 top-0 h-full z-20 md:z-auto shadow-lg md:shadow-none"
              role="complementary"
              aria-label="Meeting details sidebar"
            >
              {/* Sidebar Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {sortedMeetingsForDate.length} meeting{sortedMeetingsForDate.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Close sidebar"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                {sortedMeetingsForDate.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 text-center"
                  >
                    <div className="mb-4">
                      <ApperIcon name="Calendar" size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No meetings scheduled</p>
                      <button
                        onClick={handleCreateMeeting}
                        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
                        aria-label="Schedule a meeting for selected date"
                      >
                        Schedule a meeting
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-4 space-y-3">
                    <AnimatePresence>
                      {sortedMeetingsForDate.map((meeting, index) => (
                        <motion.article
                          key={meeting.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md group"
                          onMouseEnter={(e) => handleMeetingHover(e, meeting)}
                          onMouseLeave={handleMeetingLeave}
                        >
                          {/* Meeting Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`p-1.5 rounded-lg ${currentTheme.primary} text-white`}>
                                <ApperIcon 
                                  name={typeIcons[meeting.type] || 'Calendar'} 
                                  size={14} 
                                />
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {meeting.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditMeeting(meeting)}
                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                aria-label={`Edit ${meeting.title}`}
                              >
                                <ApperIcon name="Edit2" size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="p-1.5 text-gray-400 hover:text-error hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error/20"
                                aria-label={`Delete ${meeting.title}`}
                              >
                                <ApperIcon name="Trash2" size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Meeting Details */}
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <ApperIcon name="Clock" size={12} className="text-primary" />
                              <span className="font-medium">
                                {new Date(meeting.start).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })} - {new Date(meeting.end).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            {meeting.location && (
                              <div className="flex items-center gap-2">
                                <ApperIcon name="MapPin" size={12} className="text-primary" />
                                <span className="truncate">{meeting.location}</span>
                              </div>
                            )}

                            {meeting.attendees && meeting.attendees.length > 0 && (
                              <div className="flex items-center gap-2">
                                <ApperIcon name="Users" size={12} className="text-primary" />
                                <span>{meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>

                          {/* Meeting Description */}
                          {meeting.description && (
                            <p className="text-xs text-gray-500 mt-3 line-clamp-2 bg-white/50 rounded-lg p-2">
                              {meeting.description}
                            </p>
                          )}

                          {/* Priority Badge */}
                          <div className="flex items-center justify-between mt-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border transition-all ${priorityColors[meeting.priority]}`}>
                              {meeting.priority} priority
                            </span>
                            <div className="flex items-center gap-1">
                              {meeting.type === 'client_meeting' && (
                                <span className="w-2 h-2 bg-green-500 rounded-full" title="Client meeting" />
                              )}
                              {meeting.priority === 'high' && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="High priority" />
                              )}
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {tooltipData.visible && tooltipData.meeting && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipData.x,
              top: tooltipData.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
              <div className="font-medium mb-1">{tooltipData.meeting.title}</div>
              <div className="text-gray-300">
                {new Date(tooltipData.meeting.start).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
                {tooltipData.meeting.location && ` • ${tooltipData.meeting.location}`}
              </div>
              {tooltipData.meeting.description && (
                <div className="text-gray-400 mt-1 text-xs line-clamp-2">
                  {tooltipData.meeting.description}
                </div>
              )}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

{/* Enhanced Meeting Modal */}
      <AnimatePresence>
        {showMeetingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMeetingModal(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center justify-between">
                  <h3 id="modal-title" className="text-lg font-heading font-semibold text-gray-900">
                    {editingMeeting ? 'Edit Meeting' : 'New Meeting'}
                  </h3>
                  <button
                    onClick={() => setShowMeetingModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Close modal"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                {/* Title Field */}
                <div>
                  <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    id="meeting-title"
                    type="text"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter meeting title"
                    required
                    aria-describedby="title-error"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="meeting-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="meeting-description"
                    value={meetingForm.description}
                    onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    rows={3}
                    placeholder="Enter meeting description"
                  />
                </div>

                {/* Date and Time Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="meeting-start" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <DatePicker
                      id="meeting-start"
                      selected={meetingForm.start}
                      onChange={(date) => setMeetingForm({ ...meetingForm, start: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="meeting-end" className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <DatePicker
                      id="meeting-end"
                      selected={meetingForm.end}
                      onChange={(date) => setMeetingForm({ ...meetingForm, end: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Attendees Field */}
                <div>
                  <label htmlFor="meeting-attendees" className="block text-sm font-medium text-gray-700 mb-2">
                    Attendees
                  </label>
                  <input
                    id="meeting-attendees"
                    type="email"
                    multiple
                    value={meetingForm.attendees}
                    onChange={(e) => setMeetingForm({ ...meetingForm, attendees: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter email addresses, separated by commas"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                {/* Location Field */}
                <div>
                  <label htmlFor="meeting-location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    id="meeting-location"
                    type="text"
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter meeting location or video link"
                  />
                </div>

                {/* Type and Priority Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="meeting-type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      id="meeting-type"
                      value={meetingForm.type}
                      onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="client_meeting">Client Meeting</option>
                      <option value="presentation">Presentation</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="conference">Conference</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="meeting-priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="meeting-priority"
                      value={meetingForm.priority}
                      onChange={(e) => setMeetingForm({ ...meetingForm, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeeting}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 font-medium"
                >
                  {editingMeeting ? 'Update' : 'Create'} Meeting
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarPage;