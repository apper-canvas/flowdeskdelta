import { delay } from '../../utils/helpers';
import activitiesData from '../mockData/activities.json';

let activities = [...activitiesData];

const activityService = {
  async getAll() {
    await delay(300);
    return [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.id === id);
    return activity ? { ...activity } : null;
  },

  async create(activityData) {
    await delay(400);
    const newActivity = {
      ...activityData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, updateData) {
    await delay(350);
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    activities[index] = { ...activities[index], ...updateData };
    return { ...activities[index] };
  },

  async delete(id) {
    await delay(250);
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    const deleted = activities.splice(index, 1)[0];
    return { ...deleted };
  },

  async getByContact(contactId) {
    await delay(200);
    const filtered = activities.filter(activity => activity.contactId === contactId);
    return [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getByDeal(dealId) {
    await delay(200);
    const filtered = activities.filter(activity => activity.dealId === dealId);
    return [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getRecent(limit = 10) {
    await delay(200);
    const sorted = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sorted.slice(0, limit);
  }
};

export default activityService;