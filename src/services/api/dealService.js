import { delay } from '../../utils/helpers';
import dealsData from '../mockData/deals.json';

let deals = [...dealsData];

const dealService = {
  async getAll() {
    await delay(300);
    return [...deals];
  },

  async getById(id) {
    await delay(200);
    const deal = deals.find(d => d.id === id);
    return deal ? { ...deal } : null;
  },

  async create(dealData) {
    await delay(400);
    const newDeal = {
      ...dealData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      stage: dealData.stage || 'lead'
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, updateData) {
    await delay(350);
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deal not found');
    
    deals[index] = { ...deals[index], ...updateData };
    return { ...deals[index] };
  },

  async delete(id) {
    await delay(250);
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deal not found');
    
    const deleted = deals.splice(index, 1)[0];
    return { ...deleted };
  },

  async getByStage(stage) {
    await delay(200);
    const filtered = deals.filter(deal => deal.stage === stage);
    return [...filtered];
  },

  async updateStage(id, newStage) {
    await delay(300);
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deal not found');
    
    deals[index] = { ...deals[index], stage: newStage };
    return { ...deals[index] };
  },

  async getByContact(contactId) {
    await delay(200);
    const filtered = deals.filter(deal => deal.contactId === contactId);
    return [...filtered];
  }
};

export default dealService;