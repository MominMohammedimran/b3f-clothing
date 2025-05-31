
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Category } from '../../lib/types'; 

interface CategoryItemProps {
  category: Category;
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  const navigate = useNavigate();
  // Check if this is a design tool category
  const isDesignCategory = category.name.toLowerCase().includes('print') || 
                           category.name.toLowerCase().includes('design') || 
                           category.name.toLowerCase().includes('custom');
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Always navigate to product designer page when pencil is clicked
    navigate('/design-tool');
  };
  
  const loass=()=>{
    if(category.name==='Tshirt-print'||category.name==='mug-print'||category.name==='Cup-print'){
      return  <button 
      onClick={handleEditClick}
      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-yellow-100"
    >
      <Pencil size={16} className="text-black-600" />
    </button> 
    ;
    }
  }
  
  return (
    <div >
      <Link 
        to={isDesignCategory ? '/design-tool' : `/search?category=${category.name.toLowerCase()}`} 
        className="flex flex-col items-center relative"
      >
        <div className="category-circle pinkbg w-20 h-20 mb-2 bg-pink-100 relative rounded-full flex items-center justify-center">
          <img 
            src={category.image || '/lovable-uploads/placeholder.svg'} 
            alt={category.name} 
            className="w-12 h-12 pinkimg object-contain"
          />
       
          {loass()}
          {/* Always show pencil icon for all categories */}
         
         
        </div>
        <span className="text-sm font-medium">{category.name}</span>
      </Link>
      <style>
          {`
            @media (max-width: 640px) {
              .pinkbg{
                width:55px !important;
                height:55px !important; /* Mobile height - 300x50 */
               
              }
                .pinkimg {
                 width:35px !important;
                 height:35px !important;

                }
            }
            
          `}
        </style>
    

    </div>
    
  );
};

export default CategoryItem;
