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
    if (searchTerm.trim()) {
      const filtered = users.filter(user =>
        user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users); // Show all users when no search term
    }
  }, [searchTerm, users]);

  const getAuthToken = () => {
    // Check both sessionStorage and localStorage for flexibility
    let user = null;
    try {
      user = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return user?.token || null;
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('sessionStorage user:', sessionStorage.getItem('user'));
      console.log('localStorage user:', localStorage.getItem('user'));
      
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
      
      console.log('Fetching users with token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      // Get current user ID from token or storage
      const currentUser = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user'));
      const currentUserId = currentUser?.id;
      
      // Filter out current user and ensure all users have email
      const otherUsers = response.data
        .filter(u => u._id !== currentUserId && u.email)
        .map(u => ({
          ...u,
          displayName: u.email.split('@')[0] // Create display name from email
        }));
      
      console.log('Filtered users:', otherUsers);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers); // Set initial filtered users
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load users: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axios.get(`http://localhost:5000/api/documents/${documentId}/shared`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSharedUsers(response.data.sharedWith || []);
    } catch (error) {
      console.error('Failed to fetch shared users:', error);
      // Don't show error for this as it's not critical
    }
  };

  const toggleUserShare = async (userId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
      
      const isCurrentlyShared = sharedUsers.some(sharedUser => sharedUser._id === userId);
      
      if (isCurrentlyShared) {
        // Remove share
        await axios.delete(`http://localhost:5000/api/documents/${documentId}/share/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setSharedUsers(sharedUsers.filter(sharedUser => sharedUser._id !== userId));
        setSuccess('Document access removed successfully');
      } else {
        // Add share
        await axios.post(`http://localhost:5000/api/documents/${documentId}/share`, 
          { userId },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const newSharedUser = users.find(u => u._id === userId);
        if (newSharedUser) {
          setSharedUsers([...sharedUsers, newSharedUser]);
        }
        setSuccess('Document shared successfully');
      }
      
      if (onShareUpdate) {
        onShareUpdate();
      }
    } catch (error) {
      console.error('Failed to update sharing:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to update sharing permissions: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  // Get first letter from email for avatar
  const getFirstLetter = (email) => {
    return email && email.length > 0 ? email.charAt(0).toUpperCase() : '?';
  };

  // Get display name from email
  const getDisplayName = (user) => {
    return user.displayName || user.email?.split('@')[0] || 'Unknown User';
  };

  // Reset states when modal closes
  const handleClose = () => {
    setSearchTerm('');
    setError('');
    setSuccess('');
    onClose();
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
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="p-4 bg-gray-50 border-b text-sm">
          <p>Total users fetched: {users.length}</p>
          <p>Filtered users: {filteredUsers.length}</p>
          <p>Search term: "{searchTerm}"</p>
          <p>Currently shared with: {sharedUsers.length}</p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users by email..."
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Currently Shared With ({sharedUsers.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sharedUsers.map((sharedUser) => (
                <div key={sharedUser._id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">
                        {getFirstLetter(sharedUser.email)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getDisplayName(sharedUser)}</p>
                      <p className="text-xs text-gray-500">{sharedUser.email}</p>
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
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {users.length === 0 
                  ? 'No users available' 
                  : searchTerm 
                    ? `No users found matching "${searchTerm}"` 
                    : 'No users to display'}
              </p>
            </div>
          ) : (
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
                          {getFirstLetter(user.email)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getDisplayName(user)}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Document shared with {sharedUsers.length} user{sharedUsers.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleClose}
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
