import React from 'react';
import MetricCard from '@/components/molecules/MetricCard';
import { formatCurrency } from '@/utils/helpers';

const DashboardMetricsGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Contacts"
        value={metrics.totalContacts}
        iconName="Users"
        iconBgColor="bg-gradient-primary"
        delay={0.1}
      />
      <MetricCard
        title="Active Deals"
        value={metrics.activeDeals}
        iconName="TrendingUp"
        iconBgColor="bg-accent"
        delay={0.2}
      />
      <MetricCard
        title="Pipeline Value"
        value={formatCurrency(metrics.pipelineValue)}
        iconName="DollarSign"
        iconBgColor="bg-warning"
        delay={0.3}
      />
      <MetricCard
        title="Won Deals"
        value={metrics.wonDeals}
        iconName="Trophy"
        iconBgColor="bg-success"
        delay={0.4}
      />
    </div>
  );
};

export default DashboardMetricsGrid;