import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import ContactList from '@/components/organisms/ContactList';
import ContactForm from '@/components/organisms/ContactForm';
import { contactService } from '@/services';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingContact) {
        const updated = await contactService.update(editingContact.id, formData);
        setContacts(contacts.map(c => c.id === editingContact.id ? updated : c));
        toast.success('Contact updated successfully');
      } else {
        const newContact = await contactService.create(formData);
        setContacts([newContact, ...contacts]);
        toast.success('Contact created successfully');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save contact');
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactService.delete(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete contact');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowAddForm(true);
  };

  const allTags = [...new Set(contacts.flatMap(contact => contact.tags))];

  if (loading) {
    return (
      <div className="p-6 max-w-full overflow-hidden">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Contacts</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadContacts}
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
              Contacts
            </h1>
            <p className="text-gray-600">
              Manage your customer relationships and contact information.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <ContactList
        contacts={contacts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        allTags={allTags}
        onAddContactClick={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showAddForm && (
        <ContactForm
          initialData={editingContact}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}
    </motion.div>
  );
};

export default ContactsPage;