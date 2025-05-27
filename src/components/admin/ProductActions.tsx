
import React, { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Product } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductActionsProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product, onEdit, onDelete }) => {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleViewProduct = () => {
    setShowViewDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteDialog(false);
    toast.success(`Product "${product.name}" deleted successfully`);
  };

  return (
    <>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={handleViewProduct}>
          <Eye size={16} className="mr-1" />
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={onEdit}>
          <Edit size={16} className="mr-1" />
          Edit
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600" 
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 size={16} className="mr-1" />
          Delete
        </Button>
      </div>

      {/* Product View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View details of the product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="h-40 w-40 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="font-medium">Name:</div>
              <div className="col-span-2">{product.name}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="font-medium">Category:</div>
              <div className="col-span-2">{product.category}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="font-medium">Code:</div>
              <div className="col-span-2">{product.code}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="font-medium">Price:</div>
              <div className="col-span-2">${product.price.toFixed(2)}</div>
            </div>
            
            {product.description && (
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium">Description:</div>
                <div className="col-span-2">{product.description}</div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={onEdit}>Edit Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product 
              "{product.name}" from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductActions;
