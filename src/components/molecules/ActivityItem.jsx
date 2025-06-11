import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { formatDateTime } from '@/utils/helpers';

const activityIcons = {
  call: 'Phone',
  email: 'Mail',
  meeting: 'Calendar',
  note: 'FileText',
  task: 'CheckSquare'
};

const activityTypeColors = {
  call: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',
  meeting: 'bg-purple-100 text-purple-800',
  note: 'bg-gray-100 text-gray-800',
  task: 'bg-orange-100 text-orange-800'
};

const ActivityItem = ({ activity, contact, deal, index, onEdit, onDelete, showTimelineConnector = false }) => {
  const typeInfoColor = activityTypeColors[activity.type] || activityTypeColors.note;
  const typeInfoIcon = activityIcons[activity.type] || 'Circle';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
    >
      {showTimelineConnector && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
      )}

      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfoColor}`}>
        <ApperIcon name={typeInfoIcon} size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfoColor}`}>
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
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
              onClick={() => onEdit(activity)}
              className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
            >
              <ApperIcon name="Edit2" size={14} />
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            >
              <ApperIcon name="Trash2" size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityItem;