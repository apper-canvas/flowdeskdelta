import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import DealKanbanBoard from '@/components/organisms/DealKanbanBoard';
import DealForm from '@/components/organisms/DealForm';
import { dealService, contactService } from '@/services';

const stages = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-100 text-gray-800' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-100 text-blue-800' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { id: 'won', name: 'Won', color: 'bg-green-100 text-green-800' },
  { id: 'lost', name: 'Lost', color: 'bg-red-100 text-red-800' }
];

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null); // Managed at page/organism level

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message || 'Failed to load deals');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value) || 0
      };

      if (editingDeal) {
        const updated = await dealService.update(editingDeal.id, dealData);
        setDeals(deals.map(d => d.id === editingDeal.id ? updated : d));
        toast.success('Deal updated successfully');
      } else {
        const newDeal = await dealService.create(dealData);
        setDeals([newDeal, ...deals]);
        toast.success('Deal created successfully');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save deal');
    }
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;

    try {
      await dealService.delete(dealId);
      setDeals(deals.filter(d => d.id !== dealId));
      toast.success('Deal deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete deal');
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      const updated = await dealService.updateStage(dealId, newStage);
      setDeals(deals.map(d => d.id === dealId ? updated : d));
      toast.success(`Deal moved to ${stages.find(s => s.id === newStage)?.name}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update deal stage');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingDeal(null);
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setShowAddForm(true);
  };

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== newStage) {
      handleStageChange(draggedDeal.id, newStage);
    }
    setDraggedDeal(null);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-full overflow-hidden">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-20 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Deals</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
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
              Deal Pipeline
            </h1>
            <p className="text-gray-600">
              Track and manage your sales opportunities through the pipeline.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      <DealKanbanBoard
        deals={deals}
        contacts={contacts}
        stages={stages}
        onStageChange={handleStageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

      {showAddForm && (
        <DealForm
          initialData={editingDeal}
          contacts={contacts}
          stages={stages}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}
    </motion.div>
  );
};

export default DealsPage;