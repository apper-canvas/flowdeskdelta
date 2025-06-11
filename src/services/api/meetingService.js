import { delay } from '../../utils/helpers';
import { mockMeetings } from '../mockData/meetings';

let meetings = [...mockMeetings];

const meetingService = {
  async getAll() {
    await delay(300);
    return [...meetings];
  },

  async getById(id) {
    await delay(200);
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    return { ...meeting };
  },

  async create(meetingData) {
    await delay(400);
    const newMeeting = {
      id: Date.now(),
      ...meetingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    meetings.push(newMeeting);
    return { ...newMeeting };
  },

  async update(id, updateData) {
    await delay(350);
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Meeting not found');
    }
    
    meetings[index] = {
      ...meetings[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return { ...meetings[index] };
  },

  async delete(id) {
    await delay(250);
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Meeting not found');
    }
    
    const deletedMeeting = meetings[index];
    meetings.splice(index, 1);
    return { ...deletedMeeting };
  },

  async getByDateRange(startDate, endDate) {
    await delay(300);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return meetings.filter(meeting => {
      const meetingStart = new Date(meeting.start);
      return meetingStart >= start && meetingStart <= end;
    }).map(meeting => ({ ...meeting }));
  }
};

export default meetingService;