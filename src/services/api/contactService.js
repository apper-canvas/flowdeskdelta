import { delay } from '../../utils/helpers';
import contactsData from '../mockData/contacts.json';

let contacts = [...contactsData];

const contactService = {
  async getAll() {
    await delay(300);
    return [...contacts];
  },

  async getById(id) {
    await delay(200);
    const contact = contacts.find(c => c.id === id);
    return contact ? { ...contact } : null;
  },

  async create(contactData) {
    await delay(400);
    const newContact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, updateData) {
    await delay(350);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    contacts[index] = { ...contacts[index], ...updateData };
    return { ...contacts[index] };
  },

  async delete(id) {
    await delay(250);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    const deleted = contacts.splice(index, 1)[0];
    return { ...deleted };
  },

  async search(query) {
    await delay(200);
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.email.toLowerCase().includes(query.toLowerCase()) ||
      contact.company.toLowerCase().includes(query.toLowerCase())
    );
    return [...filtered];
  },

  async filterByTag(tag) {
    await delay(200);
    const filtered = contacts.filter(contact =>
      contact.tags.includes(tag)
    );
    return [...filtered];
  }
};

export default contactService;