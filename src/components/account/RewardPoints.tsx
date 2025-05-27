
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Award, ArrowRight, Gift, ShoppingBag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../../context/AuthContext';

const RewardPoints = () => {
  const { userProfile } = useAuth();
  const [rewardPoints, setRewardPoints] = useState(0);
  
  useEffect(() => {
    if (userProfile?.reward_points) {
      setRewardPoints(userProfile.reward_points);
    }
  }, [userProfile]);
  
  const nextRewardLevel = Math.ceil((rewardPoints + 100) / 100) * 100;
  const progress = (rewardPoints % 100) / 100 * 100;
  
  const handleEarnPoints = () => {
    toast.info('Complete purchases to earn reward points!');
  };
  
  const handleUsePoints = () => {
    if (rewardPoints < 50) {
      toast.warning('You need at least 50 points to redeem rewards');
      return;
    }
    toast.info('Reward points can be used during checkout');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Reward Points</h2>
        <button 
          onClick={handleEarnPoints}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          How to earn more <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-sm">Available Points</span>
            <div className="flex items-center space-x-2">
              <Award className="text-yellow-500" />
              <span className="text-3xl font-bold">{rewardPoints}</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-gray-500 text-sm">Next Reward at</span>
            <div className="text-xl font-semibold text-blue-600">{nextRewardLevel} points</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Current</span>
            <span>Next Reward</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            onClick={handleEarnPoints}
            className="flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ShoppingBag size={18} />
            <span>Earn Points</span>
          </button>
          
          <button 
            onClick={handleUsePoints}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg
              ${rewardPoints >= 50 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            <Gift size={18} />
            <span>Use Points</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Rewards History</h3>
        
        {rewardPoints > 0 ? (
          <div className="divide-y border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">Purchase Reward</div>
                <div className="text-sm text-gray-500">Order #ORD-123456</div>
              </div>
              <div className="text-green-600 font-semibold">+{rewardPoints} points</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <Award size={48} className="mx-auto text-gray-300 mb-2" />
            <h3 className="font-medium text-gray-700">No rewards yet</h3>
            <p className="text-sm text-gray-500 mt-1">Complete purchases to earn points</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardPoints;
