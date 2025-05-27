
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
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Your Rating</label>
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
          <label htmlFor="review" className="block mb-2 text-sm font-medium">
            Your Review
          </label>
          <textarea
            id="review"
            rows={4}
            className="w-full p-2 border rounded-md resize-none"
            placeholder="Share your experience with this product..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
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

export default ProductReview;
