import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import ContactCard from '@/components/molecules/ContactCard';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const ContactList = ({ contacts, searchQuery, onSearchChange, selectedTag, onTagChange, allTags, onAddContactClick, onEdit, onDelete }) => {
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchQuery ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || contact.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const tagOptions = [
    { value: '', label: 'All Tags' },
    ...allTags.map(tag => ({ value: tag, label: tag }))
  ];

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
          options={tagOptions}
        />
      </div>

      {filteredContacts.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium">
            {searchQuery || selectedTag ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="mt-2 text-gray-500">
            {searchQuery || selectedTag
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'
            }
          </p>
          {!searchQuery && !selectedTag && (
            <Button onClick={onAddContactClick} className="mt-4">
              Add Contact
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ContactList;