
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-4 my-8">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={`flex items-center space-x-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
      >
        <ChevronLeft size={20} />
        <span>Previous</span>
      </button>
      
      <div className="text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={`flex items-center space-x-1 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
      >
        <span>Next</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
