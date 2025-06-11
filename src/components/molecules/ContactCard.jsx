import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import { formatDate, getInitials } from '@/utils/helpers';

const statusColors = {
  lead: 'bg-gray-100 text-gray-800',
  prospect: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800'
};

const ContactCard = ({ contact, index, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Avatar initials={getInitials(contact.name)} />
          <div className="ml-3">
            <h3 className="font-medium text-gray-900 break-words">{contact.name}</h3>
            <p className="text-sm text-gray-600 break-words">{contact.company}</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
          >
            <ApperIcon name="Edit2" size={14} />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
          >
            <ApperIcon name="Trash2" size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Mail" size={14} className="mr-2 flex-shrink-0" />
          <span className="break-words">{contact.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Phone" size={14} className="mr-2 flex-shrink-0" />
          <span className="break-words">{contact.phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {contact.tags.map(tag => (
            <Badge key={tag} className="bg-primary/10 text-primary">
              {tag}
            </Badge>
          ))}
        </div>
        <Badge className={statusColors[contact.status] || statusColors.lead}>
          {contact.status}
        </Badge>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Last contact: {formatDate(contact.lastContact)}
        </p>
      </div>
    </motion.div>
  );
};

export default ContactCard;