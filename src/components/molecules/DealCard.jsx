import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { formatCurrency, formatDate } from '@/utils/helpers';

const stageColors = {
  lead: 'bg-gray-100 text-gray-800',
  qualified: 'bg-blue-100 text-blue-800',
  proposal: 'bg-yellow-100 text-yellow-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
};

const DealCard = ({ deal, contact, index, onDragStart, onEdit, onDelete }) => {
  return (
    <motion.div
      key={deal.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm break-words pr-2">
          {deal.title}
        </h4>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(deal)}
            className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
          >
            <ApperIcon name="Edit2" size={12} />
          </button>
          <button
            onClick={() => onDelete(deal.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
          >
            <ApperIcon name="Trash2" size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="text-lg font-semibold text-gray-900">
          {formatCurrency(deal.value)}
        </div>
        <div className="text-sm text-gray-600">
          {contact?.name || 'Unknown Contact'}
        </div>
        {deal.expectedClose && (
          <div className="text-xs text-gray-500">
            Expected: {formatDate(deal.expectedClose)}
          </div>
        )}
      </div>

      <div classNameName="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Probability</span>
          <span>{deal.probability}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${deal.probability}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

export default DealCard;