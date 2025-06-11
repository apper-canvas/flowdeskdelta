export const mockMeetings = [
  {
    id: 1,
    title: 'Weekly Team Standup',
    description: 'Regular team sync to discuss progress and blockers',
    attendees: ['john.doe@example.com', 'jane.smith@example.com', 'mike.johnson@example.com'],
    start: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
    location: 'Conference Room A',
    type: 'meeting',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    title: 'Client Proposal Review',
    description: 'Review and finalize the Q4 proposal for ABC Corp',
    attendees: ['sarah.wilson@example.com', 'tom.brown@example.com'],
    start: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end: new Date(Date.now() + 172800000 + 5400000).toISOString(), // Day after tomorrow + 1.5 hours
    location: 'Virtual - Zoom',
    type: 'client_meeting',
    priority: 'high',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 3,
    title: 'Product Demo',
    description: 'Demonstrate new features to the sales team',
    attendees: ['demo@example.com', 'sales-team@example.com'],
    start: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    end: new Date(Date.now() + 259200000 + 7200000).toISOString(), // 3 days from now + 2 hours
    location: 'Training Room',
    type: 'presentation',
    priority: 'medium',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 4,
    title: 'Follow-up Call with Prospect',
    description: 'Discuss next steps and answer questions about our services',
    attendees: ['prospect@newcompany.com', 'sales@example.com'],
    start: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
    end: new Date(Date.now() + 432000000 + 1800000).toISOString(), // 5 days from now + 30 minutes
    location: 'Phone Call',
    type: 'follow_up',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];