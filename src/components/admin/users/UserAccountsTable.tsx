
import React, { useState } from 'react';
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
import { Eye, Pencil } from "lucide-react";
import { formatDate } from '@/lib/utils';
import UserDetailsDialog from './UserDetailsDialog';
import { UserProfile } from '@/lib/types';

interface UserAccountsTableProps {
  users: UserProfile[];
  onViewOrderHistory: (userId: string) => void;
}

const UserAccountsTable: React.FC<UserAccountsTableProps> = ({ users, onViewOrderHistory }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  return (
    <>
      <Table>
        <TableCaption>List of all registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">No users found</TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name || user.last_name ? 
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                    'No name provided'}
                </TableCell>
                <TableCell>{user.auth_user?.email || user.email || 'No email'}</TableCell>
                <TableCell>{user.phone || 'Not provided'}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> 
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewOrderHistory(user.id)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> 
                      Orders
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedUser && (
        <UserDetailsDialog 
          user={selectedUser}
          open={showDetails}
          onOpenChange={setShowDetails}
          onViewOrderHistory={() => onViewOrderHistory(selectedUser.id)}
        />
      )}
    </>
  );
};

export default UserAccountsTable;
