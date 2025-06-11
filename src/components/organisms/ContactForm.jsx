import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import FormField from '@/components/molecules/FormField';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const tagOptions = ['enterprise', 'startup', 'decision-maker', 'technical', 'finance', 'agency', 'creative'];
const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const ContactForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tags: [],
    status: 'lead'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        company: initialData.company,
        tags: initialData.tags,
        status: initialData.status
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        tags: [],
        status: 'lead'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (tag) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags: newTags });
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
              {initialData ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Name *">
              <Input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </FormField>

            <FormField label="Email *">
              <Input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </FormField>

            <FormField label="Phone">
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </FormField>

            <FormField label="Company">
              <Input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </FormField>

            <FormField label="Tags" className="mb-2">
              <div className="space-y-2">
                {tagOptions.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      className="mr-2 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Status">
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />
            </FormField>

            <div className="flex space-x-3 pt-4">
              <Button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {initialData ? 'Update' : 'Create'} Contact
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactForm;