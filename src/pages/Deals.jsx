import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import { dealService, contactService } from '../services';
import { formatCurrency, formatDate, getContactById } from '../utils/helpers';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    value: '',
    contactId: '',
    probability: 50,
    expectedClose: '',
    stage: 'lead'
  });

  const stages = [
    { id: 'lead', name: 'Lead', color: 'bg-gray-100 text-gray-800' },
    { id: 'qualified', name: 'Qualified', color: 'bg-blue-100 text-blue-800' },
    { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { id: 'won', name: 'Won', color: 'bg-green-100 text-green-800' },
    { id: 'lost', name: 'Lost', color: 'bg-red-100 text-red-800' }
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    setFormData({
      title: '',
      value: '',
      contactId: '',
      probability: 50,
      expectedClose: '',
      stage: 'lead'
    });
    setShowAddForm(false);
    setEditingDeal(null);
  };

  const handleEdit = (deal) => {
    setFormData({
      title: deal.title,
      value: deal.value.toString(),
      contactId: deal.contactId,
      probability: deal.probability,
      expectedClose: deal.expectedClose ? deal.expectedClose.split('T')[0] : '',
      stage: deal.stage
    });
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

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Deal
          </motion.button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-[calc(100vh-250px)] overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          return (
            <div
              key={stage.id}
              className="bg-gray-50 rounded-lg p-4 min-w-[280px] flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${stage.color.split(' ')[0]}`}></span>
                  {stage.name}
                </h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {stageDeals.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ApperIcon name="Package" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">No deals</p>
                  </div>
                ) : (
                  stageDeals.map((deal, index) => {
                    const contact = getContactById(contacts, deal.contactId);
                    return (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm break-words pr-2">
                            {deal.title}
                          </h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(deal)}
                              className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
                            >
                              <ApperIcon name="Edit2" size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(deal.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            >
                              <ApperIcon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(deal.value)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact?.name || 'Unknown Contact'}
                          </div>
                          {deal.expectedClose && (
                            <div className="text-xs text-gray-500">
                              Expected: {formatDate(deal.expectedClose)}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Probability</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-gradient-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Deal Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold">
                    {editingDeal ? 'Edit Deal' : 'Add New Deal'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter deal title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact *
                    </label>
                    <select
                      required
                      value={formData.contactId}
                      onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select a contact</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {stages.map(stage => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability ({formData.probability}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={formData.expectedClose}
                      onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      {editingDeal ? 'Update' : 'Create'} Deal
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Deals;