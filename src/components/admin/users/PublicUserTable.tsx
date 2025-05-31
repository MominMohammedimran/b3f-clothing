
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, History } from "lucide-react";
import { formatDate } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PublicUserTableProps {
  users: UserProfile[];
  onViewDetails?: (user: UserProfile) => void; // Make this optional and match AdminPublicUsers
  onViewOrderHistory: (userId: string) => void;
  onEditUser: (user: UserProfile) => void;
}

const PublicUserTable: React.FC<PublicUserTableProps> = ({ 
  users, 
  onViewOrderHistory,
  onEditUser,
  onViewDetails = onEditUser // Default to onEditUser if not provided
}) => {
  // Helper function to get full name
  const getFullName = (user: UserProfile) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'No name provided';
  };
  
  // Check if user has address
  const hasAddress = (user: UserProfile) => {
    return user.address && Object.keys(user.address).length > 0;
  };

  return (
    <Table>
      <TableCaption>List of all customer accounts</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{getFullName(user)}</TableCell>
              <TableCell>{user.auth_user?.email || user.email || 'No email'}</TableCell>
              <TableCell>{user.phone || 'Not provided'}</TableCell>
              <TableCell>
                {hasAddress(user) ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">Address Set</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">No Address</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditUser(user)}
                  >
                    <Edit className="mr-1 h-4 w-4" /> 
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewOrderHistory(user.id)}
                  >
                    <History className="mr-1 h-4 w-4" /> 
                    Orders
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default PublicUserTable;
