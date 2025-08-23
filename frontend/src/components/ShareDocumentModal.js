import React, { useState, useEffect } from 'react';
import { X, Users, Search, Check, UserPlus } from 'lucide-react';
import axios from 'axios';

const ShareDocumentModal = ({ isOpen, onClose, documentId, onShareUpdate }) => {
  const [users, setUsers] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchSharedUsers();
    }
  }, [isOpen, documentId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;
      
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out current user and ensure all users have required fields
      const currentUserId = user.id;
      const otherUsers = response.data
        .filter(u => u._id !== currentUserId)
        .filter(u => u.username && u.email); // Only include users with username and email
      
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    }
  };

  const fetchSharedUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;
      
      const response = await axios.get(`http://localhost:5000/api/documents/${documentId}/shared`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSharedUsers(response.data.sharedWith || []);
    } catch (error) {
      console.error('Failed to fetch shared users:', error);
    }
  };

  const toggleUserShare = async (userId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;
      
      const isCurrentlyShared = sharedUsers.some(sharedUser => sharedUser._id === userId);
      
      if (isCurrentlyShared) {
        // Remove share
        await axios.delete(`http://localhost:5000/api/documents/${documentId}/share/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSharedUsers(sharedUsers.filter(sharedUser => sharedUser._id !== userId));
        setSuccess('Document access removed successfully');
      } else {
        // Add share
        await axios.post(`http://localhost:5000/api/documents/${documentId}/share`, 
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newSharedUser = users.find(u => u._id === userId);
        setSharedUsers([...sharedUsers, newSharedUser]);
        setSuccess('Document shared successfully');
      }
      
      if (onShareUpdate) {
        onShareUpdate();
      }
    } catch (error) {
      console.error('Failed to update sharing:', error);
      setError('Failed to update sharing permissions');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  // Helper function to safely get first letter
  const getFirstLetter = (name) => {
    return name && typeof name === 'string' && name.length > 0 
      ? name.charAt(0).toUpperCase() 
      : '?';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users size={24} className="text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-4 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Currently Shared Users */}
        {sharedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Currently Shared With ({sharedUsers.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sharedUsers.map((sharedUser) => (
                <div key={sharedUser._id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">
                        {getFirstLetter(sharedUser.username)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sharedUser.username || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{sharedUser.email || 'No email'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleUserShare(sharedUser._id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Available Users ({filteredUsers.length})
          </h3>
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const isShared = sharedUsers.some(sharedUser => sharedUser._id === user._id);
              return (
                <div
                  key={user._id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isShared 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isShared ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      <span className={`text-sm font-medium ${
                        isShared ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {getFirstLetter(user.username)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.username || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleUserShare(user._id)}
                    disabled={isLoading}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      isShared
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isShared ? (
                      <>
                        <Check size={14} />
                        <span>Shared</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Document shared with {sharedUsers.length} user{sharedUsers.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentModal;
