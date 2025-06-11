import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import MainFeature from '../components/MainFeature';
import { activityService, contactService, dealService } from '../services';
import { formatDateTime, getContactById, getDealById } from '../utils/helpers';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    type: 'note',
    description: '',
    contactId: '',
    dealId: ''
  });

  const activityTypes = [
    { id: 'call', name: 'Call', icon: 'Phone', color: 'bg-blue-100 text-blue-800' },
    { id: 'email', name: 'Email', icon: 'Mail', color: 'bg-green-100 text-green-800' },
    { id: 'meeting', name: 'Meeting', icon: 'Calendar', color: 'bg-purple-100 text-purple-800' },
    { id: 'note', name: 'Note', icon: 'FileText', color: 'bg-gray-100 text-gray-800' },
    { id: 'task', name: 'Task', icon: 'CheckSquare', color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        const updated = await activityService.update(editingActivity.id, formData);
        setActivities(activities.map(a => a.id === editingActivity.id ? updated : a));
        toast.success('Activity updated successfully');
      } else {
        const newActivity = await activityService.create(formData);
        setActivities([newActivity, ...activities]);
        toast.success('Activity logged successfully');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save activity');
    }
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await activityService.delete(activityId);
      setActivities(activities.filter(a => a.id !== activityId));
      toast.success('Activity deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete activity');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'note',
      description: '',
      contactId: '',
      dealId: ''
    });
    setShowAddForm(false);
    setEditingActivity(null);
  };

  const handleEdit = (activity) => {
    setFormData({
      type: activity.type,
      description: activity.description,
      contactId: activity.contactId || '',
      dealId: activity.dealId || ''
    });
    setEditingActivity(activity);
    setShowAddForm(true);
  };

  const filteredActivities = activities.filter(activity => {
    return !filterType || activity.type === filterType;
  });

  const getActivityTypeInfo = (type) => {
    return activityTypes.find(t => t.id === type) || activityTypes[3]; // Default to note
  };

  if (loading) {
    return (
      <div className="p-6 max-w-full overflow-hidden">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-full overflow-hidden">
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Activities</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-full overflow-hidden"
    >
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              Activities
            </h1>
            <p className="text-gray-600">
              Track all interactions and activities with your contacts and deals.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Log Activity
          </motion.button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Activities</option>
          {activityTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {/* Activities Timeline */}
      <MainFeature
        title="Activity Timeline"
        description="Chronological view of all customer interactions"
        icon="Clock"
        className="max-w-4xl"
      >
        {filteredActivities.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <ApperIcon name="Clock" className="w-16 h-16 text-gray-300 mx-auto" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium">
              {filterType ? 'No activities of this type' : 'No activities yet'}
            </h3>
            <p className="mt-2 text-gray-500">
              {filterType 
                ? 'Try changing the filter or log a new activity'
                : 'Start tracking your customer interactions'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-gradient-primary text-white rounded-lg"
            >
              Log Activity
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredActivities.map((activity, index) => {
              const contact = getContactById(contacts, activity.contactId);
              const deal = getDealById(deals, activity.dealId);
              const typeInfo = getActivityTypeInfo(activity.type);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  {/* Timeline connector */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}

                  {/* Activity icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                    <ApperIcon name={typeInfo.icon} size={18} />
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2 break-words">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {contact && (
                            <div className="flex items-center">
                              <ApperIcon name="User" size={14} className="mr-1" />
                              <span>{contact.name}</span>
                            </div>
                          )}
                          {deal && (
                            <div className="flex items-center">
                              <ApperIcon name="TrendingUp" size={14} className="mr-1" />
                              <span>{deal.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEdit(activity)}
                          className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
                        >
                          <ApperIcon name="Edit2" size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </MainFeature>

      {/* Add/Edit Activity Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold">
                    {editingActivity ? 'Edit Activity' : 'Log New Activity'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {activityTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder="Describe the activity..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact
                    </label>
                    <select
                      value={formData.contactId}
                      onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select a contact (optional)</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal
                    </label>
                    <select
                      value={formData.dealId}
                      onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select a deal (optional)</option>
                      {deals.map(deal => (
                        <option key={deal.id} value={deal.id}>
                          {deal.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      {editingActivity ? 'Update' : 'Log'} Activity
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Activities;