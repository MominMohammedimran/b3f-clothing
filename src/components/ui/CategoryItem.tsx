import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Category } from '../../lib/types';

interface CategoryItemProps {
  category: Category;
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  const navigate = useNavigate();

  const nameLower = category.name.toLowerCase();
  const isDesignCategory =
    nameLower.includes('print') ||
    nameLower.includes('design') ||
    nameLower.includes('custom');

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/design-tool');
  };

  return (
    <div>
      <Link
        to={isDesignCategory ? '/design-tool' : `/search?category=${nameLower}`}
        className="flex flex-col items-center relative"
      >
        <div className="category-circle pinkbg w-20 h-20 mb-2 bg-pink-100 relative rounded-full flex items-center justify-center">
          <img
            src={category.icon || '/lovable-uploads/placeholder.svg'}
            alt={`hero-categorie${category.name}`}
            width={40}
            height={40}
            className="pinkimg object-contain"
            loading="lazy"
            
          />

          {isDesignCategory && (
            <button
              onClick={handleEditClick}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-yellow-100"
              aria-label={`Customize ${category.name}`}
            >
              <Pencil size={16} className="text-black-600" />
            </button>
          )}
        </div>
        <span className="text-sm font-medium text-center">{category.name}</span>
      </Link>

      <style>
        {`
          @media (max-width: 640px) {
            .pinkbg {
              width: 55px !important;
              height: 55px !important;
            }
            .pinkimg {
              width: 35px !important;
              height: 35px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CategoryItem;
