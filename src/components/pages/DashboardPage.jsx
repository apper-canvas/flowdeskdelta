import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import DashboardMetricsGrid from '@/components/organisms/DashboardMetricsGrid';
import ActivityTimeline from '@/components/organisms/ActivityTimeline';
import FeatureCard from '@/components/molecules/FeatureCard';
import DealCard from '@/components/molecules/DealCard'; // For pipeline overview
import { contactService, dealService, activityService } from '@/services';
import { formatCurrency, getContactById } from '@/utils/helpers';

const DashboardPage = () => {
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contactsData, dealsData, activitiesData] = await Promise.all([
          contactService.getAll(),
          dealService.getAll(),
          activityService.getRecent(8)
        ]);
        setContacts(contactsData);
        setDeals(dealsData);
        setActivities(activitiesData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const metrics = {
    totalContacts: contacts.length,
    activeDeals: deals.filter(deal => !['won', 'lost'].includes(deal.stage)).length,
    pipelineValue: deals
      .filter(deal => !['won', 'lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + deal.value, 0),
    wonDeals: deals.filter(deal => deal.stage === 'won').length
  };

  const stageColors = {
    lead: 'bg-gray-100 text-gray-800',
    qualified: 'bg-blue-100 text-blue-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="p-6 max-w-full overflow-hidden">
        <div className="space-y-6">
          {/* Metrics skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </motion.div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      <div className="space-y-6">
        <DashboardMetricsGrid metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureCard
            title="Recent Activities"
            description="Latest interactions and updates"
            icon="Clock"
          >
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Clock" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-600">Start tracking your customer interactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const contact = getContactById(contacts, activity.contactId);
                  return (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      contact={contact}
                      index={index}
                      showTimelineConnector={false} /* No timeline connector in dashboard overview */
                      onEdit={() => {}} // No edit/delete from dashboard overview
                      onDelete={() => {}}
                    />
                  );
                })}
              </div>
            )}
          </FeatureCard>

          <FeatureCard
            title="Deal Pipeline"
            description="Current deals by stage"
            icon="TrendingUp"
          >
            {deals.filter(deal => !['won', 'lost'].includes(deal.stage)).length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="TrendingUp" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active deals yet</h3>
                <p className="text-gray-600">Create your first deal to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.filter(deal => !['won', 'lost'].includes(deal.stage)).map((deal, index) => {
                  const contact = getContactById(contacts, deal.contactId);
                  return (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 break-words">
                          {deal.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColors[deal.stage] || stageColors.lead}`}>
                          {deal.stage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{contact?.name || 'Unknown Contact'}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Probability</span>
                          <span>{deal.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${deal.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </FeatureCard>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;