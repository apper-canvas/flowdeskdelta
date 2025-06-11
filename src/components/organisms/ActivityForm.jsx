import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import FormField from '@/components/molecules/FormField';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import Button from '@/components/atoms/Button';

const activityTypes = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'task', label: 'Task' }
];

const ActivityForm = ({ initialData, contacts, deals, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'note',
    description: '',
    contactId: '',
    dealId: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        description: initialData.description,
        contactId: initialData.contactId || '',
        dealId: initialData.dealId || ''
      });
    } else {
      setFormData({
        type: 'note',
        description: '',
        contactId: '',
        dealId: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
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
              {initialData ? 'Edit Activity' : 'Log New Activity'}
            </h2>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Activity Type *">
              <Select
                required
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={activityTypes}
              />
            </FormField>

            <FormField label="Description *">
              <Textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the activity..."
              />
            </FormField>

            <FormField label="Contact">
              <Select
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a contact (optional)', disabled: true },
                  ...contacts.map(c => ({ value: c.id, label: `${c.name} - ${c.company}` }))
                ]}
              />
            </FormField>

            <FormField label="Deal">
              <Select
                name="dealId"
                value={formData.dealId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a deal (optional)', disabled: true },
                  ...deals.map(d => ({ value: d.id, label: d.title }))
                ]}
              />
            </FormField>

            <div className="flex space-x-3 pt-4">
              <Button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {initialData ? 'Update' : 'Log'} Activity
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivityForm;