import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import FeatureCard from '@/components/molecules/FeatureCard';
import ActivityItem from '@/components/molecules/ActivityItem';
import { getContactById, getDealById } from '@/utils/helpers';

const ActivityTimeline = ({ activities, contacts, deals, filterType, onEdit, onDelete, onLogActivityClick }) => {
  const filteredActivities = activities.filter(activity => {
    return !filterType || activity.type === filterType;
  });

  const activityTypeMap = {
    call: { id: 'call', name: 'Call', icon: 'Phone', color: 'bg-blue-100 text-blue-800' },
    email: { id: 'email', name: 'Email', icon: 'Mail', color: 'bg-green-100 text-green-800' },
    meeting: { id: 'meeting', name: 'Calendar', color: 'bg-purple-100 text-purple-800' },
    note: { id: 'note', name: 'Note', icon: 'FileText', color: 'bg-gray-100 text-gray-800' },
    task: { id: 'task', name: 'Task', icon: 'CheckSquare', color: 'bg-orange-100 text-orange-800' }
  };

  return (
    <FeatureCard
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
            {filterType ? `No ${filterType} activities found` : 'No activities yet'}
          </h3>
          <p className="mt-2 text-gray-500">
            {filterType
              ? 'Try changing the filter or log a new activity'
              : 'Start tracking your customer interactions'
            }
          </p>
          <button
            onClick={onLogActivityClick}
            className="mt-4 px-4 py-2 bg-gradient-primary text-white rounded-lg"
          >
            Log Activity
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredActivities.map((activity, index) => {
            const contact = getContactById(contacts, activity.contactId);
            const deal = getDealById(deals, activity.dealId);
            return (
              <ActivityItem
                key={activity.id}
                activity={activity}
                contact={contact}
                deal={deal}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                showTimelineConnector={index < filteredActivities.length - 1}
              />
            );
          })}
        </div>
      )}
    </FeatureCard>
  );
};

export default ActivityTimeline;