
import React, { createContext, useContext, useEffect, useState } from 'react';
import { orderMicroservice, OrderMicroservice } from '@/services/microservices/orderService';
import { EdgeFunctionApiService } from '@/services/microservices/api';
import { NotificationType, sendNotification } from '@/services/notificationService';

interface MicroservicesContextType {
  orderService: OrderMicroservice;
  isReady: boolean;
  sendNotification: (userId: string, orderId: string, type: NotificationType, data?: any) => Promise<boolean>;
}

const MicroservicesContext = createContext<MicroservicesContextType | undefined>(undefined);

export const MicroservicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeMicroservices = async () => {
      try {
        // Simulate initialization process
        console.log('Initializing microservices...');
        // This is where you would perform any setup needed
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing microservices:', error);
      }
    };

    initializeMicroservices();
  }, []);

  // Wrapper for sending notifications
  const handleSendNotification = async (
    userId: string, 
    orderId: string, 
    type: NotificationType, 
    data?: any
  ): Promise<boolean> => {
    return await sendNotification({
      userId,
      orderId,
      type,
      data
    });
  };

  const value = {
    orderService: orderMicroservice,
    isReady,
    sendNotification: handleSendNotification
  };

  return (
    <MicroservicesContext.Provider value={value}>
      {children}
    </MicroservicesContext.Provider>
  );
};

export const useMicroservices = (): MicroservicesContextType => {
  const context = useContext(MicroservicesContext);
  
  if (context === undefined) {
    throw new Error('useMicroservices must be used within a MicroservicesProvider');
  }
  
  return context;
};
