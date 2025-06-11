import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const getDateMeetings = (date) => {
    const dateStr = date.toDateString();
    return meetings.filter(meeting => 
      new Date(meeting.start).toDateString() === dateStr
    );
  };

  const renderCalendarCell = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dayMeetings = getDateMeetings(date);
    if (dayMeetings.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1 right-1">
        <div className="flex flex-wrap gap-1">
          {dayMeetings.slice(0, 2).map((meeting) => (
            <div
              key={meeting.id}
              className={`h-1 rounded-full flex-1 min-w-0 ${
                meeting.priority === 'high' ? 'bg-error' :
                meeting.priority === 'medium' ? 'bg-warning' : 'bg-primary'
              }`}
            />
          ))}
          {dayMeetings.length > 2 && (
            <div className="h-1 w-1 rounded-full bg-gray-400" />
          )}
        </div>
      </div>
    );
  };

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
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Schedule and manage your meetings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                    viewMode === mode
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreateMeeting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ApperIcon name="Plus" size={16} />
              <span className="hidden sm:inline">New Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
            <div className="p-6">
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                inline
                calendarClassName="w-full"
                dayClassName={(date) => {
                  const dayMeetings = getDateMeetings(date);
                  return `relative ${dayMeetings.length > 0 ? 'has-meetings' : ''}`;
                }}
                renderDayContents={(day, date) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span>{day}</span>
                    {renderCalendarCell({ date, view: 'month' })}
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white flex-shrink-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-heading font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getDateMeetings(selectedDate).length} meeting{getDateMeetings(selectedDate).length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {getDateMeetings(selectedDate).length === 0 ? (
              <div className="p-6 text-center">
                <ApperIcon name="Calendar" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No meetings scheduled</p>
                <button
                  onClick={handleCreateMeeting}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Schedule a meeting
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {getDateMeetings(selectedDate)
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ApperIcon 
                            name={typeIcons[meeting.type] || 'Calendar'} 
                            size={16} 
                            className="text-primary" 
                          />
                          <h4 className="font-medium text-gray-900 text-sm">
                            {meeting.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditMeeting(meeting)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                          >
                            <ApperIcon name="Edit2" size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="p-1 text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Clock" size={12} />
                          <span>
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
                          <div className="flex items-center gap-1">
                            <ApperIcon name="MapPin" size={12} />
                            <span>{meeting.location}</span>
                          </div>
                        )}

                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Users" size={12} />
                            <span>{meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {meeting.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[meeting.priority]}`}>
                          {meeting.priority} priority
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-heading font-semibold text-gray-900">
                {editingMeeting ? 'Edit Meeting' : 'New Meeting'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={3}
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <DatePicker
                    selected={meetingForm.start}
                    onChange={(date) => setMeetingForm({ ...meetingForm, start: date })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <DatePicker
                    selected={meetingForm.end}
                    onChange={(date) => setMeetingForm({ ...meetingForm, end: date })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendees
                </label>
                <input
                  type="text"
                  value={meetingForm.attendees}
                  onChange={(e) => setMeetingForm({ ...meetingForm, attendees: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter email addresses, separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={meetingForm.location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter meeting location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="client_meeting">Client Meeting</option>
                    <option value="presentation">Presentation</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={meetingForm.priority}
                    onChange={(e) => setMeetingForm({ ...meetingForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeeting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                {editingMeeting ? 'Update' : 'Create'} Meeting
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CalendarPage;