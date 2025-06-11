import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import DealCard from '@/components/molecules/DealCard';
import { getContactById } from '@/utils/helpers';

const DealKanbanBoard = ({ deals, contacts, stages, onStageChange, onEdit, onDelete, onDragStart, onDragOver, onDrop }) => {
  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-[calc(100vh-250px)] overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage.id);
        return (
          <div
            key={stage.id}
            className="bg-gray-50 rounded-lg p-4 min-w-[280px] flex flex-col"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, stage.id)}
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
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      contact={contact}
                      index={index}
                      onDragStart={onDragStart}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealKanbanBoard;