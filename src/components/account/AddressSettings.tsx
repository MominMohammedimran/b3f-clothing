
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash, MapPin, Check } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const AddressSettings = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Load saved addresses on mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem('savedAddresses');
    if (savedAddresses) {
      try {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
      } catch (error) {
        console.error('Error parsing saved addresses:', error);
      }
    }
  }, []);

  // Save addresses to localStorage when they change
  useEffect(() => {
    if (addresses.length > 0) {
      localStorage.setItem('savedAddresses', JSON.stringify(addresses));
    }
  }, [addresses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingAddressId(null);
    resetForm();
  };

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast.success('Address deleted');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
    toast.success('Default address updated');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingAddressId) {
      // Update existing address
      setAddresses(prev => 
        prev.map(addr => {
          if (addr.id === editingAddressId) {
            return { ...formData, id: addr.id };
          }
          
          // If this is set as default, unset other defaults
          if (formData.isDefault && addr.isDefault) {
            return { ...addr, isDefault: false };
          }
          
          return addr;
        })
      );
      toast.success('Address updated');
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: `addr_${Date.now()}`,
      };
      
      setAddresses(prev => {
        // If this is the first address or set as default, unset other defaults
        if (formData.isDefault || prev.length === 0) {
          return [
            ...prev.map(addr => ({ ...addr, isDefault: false })),
            { ...newAddress, isDefault: true }
          ];
        }
        return [...prev, newAddress];
      });
      
      toast.success('New address added');
    }
    
    // Reset and hide form
    resetForm();
    setShowAddForm(false);
    setEditingAddressId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
    setEditingAddressId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">My Addresses</h2>
      
      {!showAddForm && (
        <Button 
          onClick={handleAddNew}
          className="mb-6 bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle size={16} className="mr-2" />
          Add New Address
        </Button>
      )}
      
      {showAddForm ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 animate-fade-in">
          <h3 className="font-medium mb-4">
            {editingAddressId ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Apt 4B"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Set as default address
              </label>
            </div>
            
            <div className="flex space-x-4 pt-2">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingAddressId ? 'Update Address' : 'Add Address'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div 
              key={address.id}
              className={`border rounded-lg p-4 ${address.isDefault ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">{address.name}</h3>
                    {address.isDefault && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                </div>
                
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Set as default"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleEdit(address)}
                    className="text-gray-600 hover:text-gray-800"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-700">
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-gray-500 flex items-center">
                  <MapPin size={14} className="mr-1" />
                  Delivery Address
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin size={36} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">You haven't added any addresses yet.</p>
          <p className="text-gray-500 text-sm">Add your first address to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AddressSettings;
