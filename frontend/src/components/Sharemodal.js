import React, { useState, useEffect } from 'react';
import { X, Share2, Users, Mail, Copy, Check, UserPlus, Trash2, Crown, Eye, Edit } from 'lucide-react';
import axios from 'axios';

const ShareModal = ({ isOpen, onClose, document }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view'); // 'view' or 'edit'
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const token = currentUser?.token;

  useEffect(() => {
    if (isOpen && document) {
      fetchSharedUsers();
      generateShareLink();
    }
  }, [isOpen, document]);

  const fetchSharedUsers = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/documents/${document._id}/shares`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSharedUsers(data);
    } catch (error) {
      console.error('Failed to fetch shared users:', error);
    }
  };

  const generateShareLink = () => {
    // Generate a shareable link (you might want to use a more secure method)
    const link = `${window.location.origin}/shared/${document._id}`;
    setShareLink(link);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/documents/${document._id}/share`,
        { email: email.trim(), permission },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Document shared successfully!');
      setMessageType('success');
      setEmail('');
      fetchSharedUsers();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to share document');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (shareId) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${document._id}/shares/${shareId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage('Access removed successfully!');
      setMessageType('success');
      fetchSharedUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to remove access');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdatePermission = async (shareId, newPermission) => {
    try {
      await axios.put(
        `http://localhost:5000/api/documents/${document._id}/shares/${shareId}`,
        { permission: newPermission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchSharedUsers();
      setMessage('Permission updated successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update permission');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Share2 className="text-gray-700" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Document</h2>
              <p className="text-sm text-gray-600 mt-1">{document?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Share Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserPlus size={20} className="mr-2" />
              Add People
            </h3>
            
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Enter email address"
                    required
                  />
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Mail size={16} />
                <span>{isLoading ? 'Sharing...' : 'Send Invitation'}</span>
              </button>
            </form>
          </div>

          {/* Share Link */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Copy size={20} className="mr-2" />
              Share Link
            </h3>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{linkCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can view the document
            </p>
          </div>

          {/* Shared Users List */}
          {sharedUsers.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users size={20} className="mr-2" />
                People with Access ({sharedUsers.length})
              </h3>
              
              <div className="space-y-3">
                {/* Document Owner */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {document.owner?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{document.owner?.username}</p>
                      <p className="text-sm text-gray-600">{document.owner?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown size={16} className="text-yellow-500" />
                    <span className="text-sm text-gray-600">Owner</span>
                  </div>
                </div>

                {/* Shared Users */}
                {sharedUsers.map((share) => (
                  <div key={share._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {share.user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{share.user?.username}</p>
                        <p className="text-sm text-gray-600">{share.user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Permission Selector */}
                      <select
                        value={share.permission}
                        onChange={(e) => handleUpdatePermission(share._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      >
                        <option value="view">View Only</option>
                        <option value="edit">Can Edit</option>
                      </select>
                      
                      {/* Permission Icon */}
                      {share.permission === 'edit' ? (
                        <Edit size={16} className="text-green-600" />
                      ) : (
                        <Eye size={16} className="text-gray-600" />
                      )}
                      
                      {/* Remove Access Button */}
                      <button
                        onClick={() => handleRemoveShare(share._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove access"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;