import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import ActivityTimeline from '@/components/organisms/ActivityTimeline';
import ActivityForm from '@/components/organisms/ActivityForm';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import { activityService, contactService, dealService } from '@/services';

const activityTypeOptions = [
  { value: '', label: 'All Activities' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'task', label: 'Task' }
];

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterType, setFilterType] = useState('');

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

  const handleFormSubmit = async (formData) => {
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
    setShowAddForm(false);
    setEditingActivity(null);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowAddForm(true);
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
          <Button onClick={() => setShowAddForm(true)} className="flex items-center">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Log Activity
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={activityTypeOptions}
        />
      </div>

      <ActivityTimeline
        activities={activities}
        contacts={contacts}
        deals={deals}
        filterType={filterType}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLogActivityClick={() => setShowAddForm(true)}
      />

      {showAddForm && (
        <ActivityForm
          initialData={editingActivity}
          contacts={contacts}
          deals={deals}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}
    </motion.div>
  );
};

export default ActivitiesPage;