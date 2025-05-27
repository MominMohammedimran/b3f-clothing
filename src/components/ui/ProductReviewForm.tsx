
import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ProductReviewFormProps {
  productId: string;
  onSubmit: (rating: number, reviewText: string) => void;
}

const ProductReviewForm = ({ productId, onSubmit }: ProductReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (reviewText.trim().length < 5) {
      toast.error('Please write a review with at least 5 characters');
      return;
    }
    
    onSubmit(rating, reviewText);
    setRating(0);
    setReviewText('');
    toast.success('Review submitted successfully!');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Your Rating</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl p-1"
              >
                <Star 
                  className={`${
                    (hoverRating || rating) >= value 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                  size={24}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="review" className="block mb-2 text-sm font-medium">
            Your Review
          </label>
          <textarea
            id="review"
            rows={4}
            className="w-full p-2 border rounded-md resize-none"
            placeholder="Share your experience with this product..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ProductReviewForm;
