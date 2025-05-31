
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from '@/lib/types';
import ProductForm from './form/ProductForm';

interface ProductDialogsProps {
  showEditDialog: boolean;
  showAddDialog: boolean;
  selectedProduct: Product | null;
  imagePreviewUrl: string;
  onEditDialogChange: (open: boolean) => void;
  onAddDialogChange: (open: boolean) => void;
  onImageSelected: (file: File, previewUrl: string) => void;
  onSaveProduct: (product: Product) => void;
}

const ProductDialogs: React.FC<ProductDialogsProps> = ({
  showEditDialog,
  showAddDialog,
  selectedProduct,
  imagePreviewUrl,
  onEditDialogChange,
  onAddDialogChange,
  onImageSelected,
  onSaveProduct
}) => {
  // Default empty product for the add dialog
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    image: '',
    images: [],
    code: '',
    category: '',
    tags: [],
    sizes: [],
    stock: 0
  });
  
  return (
    <>
      {/* Edit Product Dialog */}
      {selectedProduct && (
        <Dialog open={showEditDialog} onOpenChange={onEditDialogChange}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={{
                ...selectedProduct,
                image: imagePreviewUrl || selectedProduct.image
              }}
              onSave={onSaveProduct}
              onCancel={() => onEditDialogChange(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={onAddDialogChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={{
              ...newProduct,
              image: imagePreviewUrl
            }}
            onSave={onSaveProduct}
            onCancel={() => onAddDialogChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDialogs;
