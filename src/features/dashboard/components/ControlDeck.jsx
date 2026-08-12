import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../dashboardSlice';
import Button from '../../../shared/components/Button/Button';

export default function ControlDeck() {
  const dispatch = useDispatch();

  const handleRefreshClick = () => {
    dispatch(fetchUsers());
  };

  return (
    <div className="bg-appCard border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
      <div>
        <h2 className="text-md font-bold mb-1">Admin Control Deck</h2>
        <p className="text-xs text-appTextGray mb-6">Manage data sync nodes and administrative parameters</p>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-appTextGray">DB Cluster sync:</span>
            <span className="font-bold text-appSecondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-appSecondary animate-pulse" />
              SYNCHRONIZED
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-appTextGray">Backend Node:</span>
            <span className="text-appTextLight font-bold">Node/Express (Railway)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-appTextGray">Database:</span>
            <span className="text-appTextLight font-bold">MongoDB (lean-optimized)</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mt-6">
        <Button
          variant="secondary"
          onClick={handleRefreshClick}
        >
          Refresh Users Registry
        </Button>
      </div>
    </div>
  );
}
