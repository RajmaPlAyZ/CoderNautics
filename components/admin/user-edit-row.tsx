import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface UserEditRowProps {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null; // Added photoURL
    disabled: boolean;
    emailVerified: boolean;
  };
  onSave: (updatedUser: UserEditRowProps['user']) => void;
  onCancel: () => void;
  isSaving: boolean; // Added isSaving prop
}

export default function UserEditRow({ user, onSave, onCancel, isSaving }: UserEditRowProps) {
  const [editedUser, setEditedUser] = useState(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(editedUser);
  };

  return (
    <tr key={user.uid} className="bg-blue-50"> {/* Highlight row being edited */}
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center">
          {/* Avatar/initials - not editable here */}
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center overflow-hidden">
             {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-base sm:text-lg font-bold text-gray-600">
                  {(user.displayName || user.email || '?')[0]?.toUpperCase()}
                </span>
              )}
          </div>
          <div className="ml-3 sm:ml-4">
             <input
                type="text"
                name="displayName"
                value={editedUser.displayName || ''}
                onChange={handleChange}
                className="text-xs sm:text-sm font-medium text-gray-900 font-comic w-full border rounded px-2 py-1"
                placeholder="Display Name"
              />
            <div className="text-xs text-gray-500 font-comic">
              {user.uid.slice(0, 8)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
         <input
            type="email"
            name="email"
            value={editedUser.email || ''}
            onChange={handleChange}
            className="text-xs sm:text-sm text-gray-900 font-comic w-full border rounded px-2 py-1"
            placeholder="Email"
          />
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col space-y-2">
          <label className="flex items-center text-xs sm:text-sm text-gray-700 font-comic">
            <input
              type="checkbox"
              name="emailVerified"
              checked={editedUser.emailVerified}
              onChange={handleChange}
              className="mr-2"
            />
            Email Verified
          </label>
           <label className="flex items-center text-xs sm:text-sm text-gray-700 font-comic">
            <input
              type="checkbox"
              name="disabled"
              checked={editedUser.disabled}
              onChange={handleChange}
              className="mr-2"
            />
            Disabled
          </label>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs sm:text-sm border-2 border-black shadow-[0_2px_0_#222]"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
           <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="font-bold text-xs sm:text-sm border-2 border-black shadow-[0_2px_0_#222]"
          >
            Cancel
          </Button>
        </div>
      </td>
    </tr>
  );
} 