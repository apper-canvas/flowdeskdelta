import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import FormField from '@/components/molecules/FormField';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const stageOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
];

const DealForm = ({ initialData, contacts, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    contactId: '',
    probability: 50,
    expectedClose: '',
    stage: 'lead'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        value: initialData.value.toString(),
        contactId: initialData.contactId,
        probability: initialData.probability,
        expectedClose: initialData.expectedClose ? initialData.expectedClose.split('T')[0] : '',
        stage: initialData.stage
      });
    } else {
      setFormData({
        title: '',
        value: '',
        contactId: '',
        probability: 50,
        expectedClose: '',
        stage: 'lead'
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
              {initialData ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Deal Title *">
              <Input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter deal title"
              />
            </FormField>

            <FormField label="Deal Value *">
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Contact *">
              <Select
                required
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a contact', disabled: true },
                  ...contacts.map(c => ({ value: c.id, label: `${c.name} - ${c.company}` }))
                ]}
              />
            </FormField>

            <FormField label="Stage">
              <Select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                options={stageOptions}
              />
            </FormField>

            <FormField label={`Probability (${formData.probability}%)`}>
              <Input
                type="range"
                min="0"
                max="100"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Expected Close Date">
              <Input
                type="date"
                name="expectedClose"
                value={formData.expectedClose}
                onChange={handleChange}
              />
            </FormField>

            <div className="flex space-x-3 pt-4">
              <Button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {initialData ? 'Update' : 'Create'} Deal
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DealForm;