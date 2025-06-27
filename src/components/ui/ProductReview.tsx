

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from "sonner";

interface ProductReviewProps {
  productId: string;
  onSubmit: (rating: number, review: string) => void;
}

const ProductReview = ({ productId, onSubmit }: ProductReviewProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast("Rating required", {
        description: "Please select a star rating before submitting"
      });
      return;
    }
    
    if (review.trim().length < 5) {
      toast("Review too short", {
        description: "Please write a more detailed review"
      });
      return;
    }
    
    onSubmit(rating, review);
    setRating(0);
    setReview('');
    
    toast("Review submitted", {
      description: "Thank you for your feedback!"
    });
  };

  return (
    <div className="bg-slate-100 p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-800">Your Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl p-1 transition-colors"
              >
                <Star
                  className={`
                    ${(hoverRating || rating) >= value 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                    }
                    transition-colors
                  `}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="review" className="block mb-2 text-sm font-medium text-gray-800">
            Your Review
          </label>
          <textarea
            id="review"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your experience with this product..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm ring-1 ring-blue-600"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ProductReview;

