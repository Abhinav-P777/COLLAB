import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDocumentById, updateDocument, deleteDocument } from '../services/documentService';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Save, Trash2, Users, Clock, Share2 } from 'lucide-react';
import SimpleNavbar from './SimpleNavbar';
import ShareDocumentModal from '../components/ShareDocumentModal';

const DocumentDetails = () => {
  const socketRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserRef = useRef(null); // Store current user to avoid stale closure
  
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedUsersCount, setSharedUsersCount] = useState(0);
  
  // Online users state
  const [onlineUsers, setOnlineUsers] = useState([]);

  const location = useLocation();
  const message = location.state?.message;

  // Colors for user avatars
  const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];

  const getCurrentUser = () => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  };

  // Initialize socket for real-time collaboration
  useEffect(() => {
    const currentUser = getCurrentUser();
    currentUserRef.current = currentUser; // Store in ref to avoid stale closure
    
    if (!currentUser) {
      navigate('/');
      return;
    }

    console.log('🔌 Initializing socket connection...');
    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id);
      socket.emit('joinDocument', { 
        documentId: id, 
        userId: currentUser.id,
        username: currentUser.username || currentUser.email?.split('@')[0] || 'Anonymous'
      });
    });

    // Listen for document updates from other users
    socket.on('receiveUpdate', ({ title: newTitle, content: newContent, userId }) => {
      console.log('📝 Received document update from user:', userId);
      
      // Only update if change came from another user
      if (userId !== currentUserRef.current?.id) {
        console.log('📥 Updating local content from remote user');
        setTitle(newTitle);
        setContent(newContent);
        setLastSaved(new Date()); // Update last saved timestamp
      }
    });

    // Listen for online users updates
    socket.on('onlineUsers', (users) => {
      console.log('👥 Online users updated:', users);
      setOnlineUsers(users);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    return () => {
      console.log('🔌 Cleaning up socket connection');
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id, navigate]);

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        console.log('📄 Fetching document data...');
        const doc = await getDocumentById(id);
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setLastSaved(new Date(doc.updatedAt || doc.createdAt));
        setSharedUsersCount(doc.sharedWith ? doc.sharedWith.length : 0);
        console.log('📄 Document loaded successfully');
      } catch (error) {
        console.error('❌ Failed to fetch document:', error);
        setError('Failed to fetch document');
      }
    };
    fetchDocument();
  }, [id]);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateDocument(id, { title, content });
      setSuccessMessage('Document updated successfully!');
      setLastSaved(new Date());
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to update document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await deleteDocument(id);
        navigate('/dashboard');
      } catch (error) {
        setError('Failed to delete document');
        setIsLoading(false);
      }
    }
  };

const handleTitleChange = (e) => {
  const newTitle = e.target.value;
  setTitle(newTitle);
  
  const currentUser = getCurrentUser();
  console.log('📤 Sending title update with userId:', currentUser?.id);
  
  if (socketRef.current && socketRef.current.connected && currentUser?.id) {
    socketRef.current.emit('documentUpdate', {
      documentId: id,
      title: newTitle,
      content,
      userId: currentUser.id  // ← Send userId with each update
    });
  }
};

const handleContentChange = (value) => {
  setContent(value);
  
  const currentUser = getCurrentUser();
  console.log('📤 Sending content update with userId:', currentUser?.id);
  
  if (socketRef.current && socketRef.current.connected && currentUser?.id) {
    socketRef.current.emit('documentUpdate', {
      documentId: id,
      title,
      content: value,
      userId: currentUser.id  // ← Send userId with each update
    });
  }
};

  const handleShareUpdate = () => {
    const fetchDocument = async () => {
      try {
        const doc = await getDocumentById(id);
        setSharedUsersCount(doc.sharedWith ? doc.sharedWith.length : 0);
      } catch (error) {
        console.error('Failed to refresh document data:', error);
      }
    };
    fetchDocument();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="text-red-600 text-center">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SimpleNavbar />
      <div className="flex-1 ml-80">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Back button and title */}
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>
                
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg px-2 py-1 flex-1 max-w-md"
                  placeholder="Document title..."
                />
              </div>

              {/* Right side - Actions and info */}
              <div className="flex items-center space-x-4">
                {/* Socket Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    socketRef.current?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-500">
                    {socketRef.current?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Online Users Indicator */}
                {onlineUsers.length > 0 && (
                  <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Online</span>
                    </div>
                    
                    <div className="flex -space-x-2">
                      {onlineUsers.slice(0, 5).map((user, index) => (
                        <div
                          key={user.socketId}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white"
                          style={{ backgroundColor: userColors[index % userColors.length] }}
                          title={user.username}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {onlineUsers.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                          +{onlineUsers.length - 5}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-sm text-green-700 font-medium">
                      {onlineUsers.length} editing
                    </span>
                  </div>
                )}

                {lastSaved && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
                
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                  {sharedUsersCount > 0 && (
                    <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                      {sharedUsersCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{isLoading ? 'Saving...' : 'Save'}</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          </div>
        )}

        {/* Document Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Document Info */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Created: {new Date(document.createdAt).toLocaleString()}</span>
                  {document.updatedAt && document.updatedAt !== document.createdAt && (
                    <span>Updated: {new Date(document.updatedAt).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {sharedUsersCount > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>Shared with {sharedUsersCount} user{sharedUsersCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {/* Online Status in Document Info */}
                  {onlineUsers.length > 0 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>
                        {onlineUsers.map(user => user.username).join(', ')} 
                        {onlineUsers.length === 1 ? ' is' : ' are'} currently editing
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="p-6">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={handleContentChange}
                style={{ minHeight: '500px' }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    [{ color: [] }, { background: [] }],
                    ['link', 'image'],
                    ['blockquote', 'code-block'],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'align',
                  'color', 'background',
                  'link', 'image',
                  'blockquote', 'code-block',
                ]}
              />
            </div>
            
            <div className="flex justify-end text-xs px-2 py-2 text-gray-500">
              Words: {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length} | 
              Characters: {content.replace(/<[^>]*>/g, '').length}
            </div>
          </div>

          {/* Document Stats */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Word Count</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Character Count</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {content.replace(/<[^>]*>/g, '').length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Online Users</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {onlineUsers.length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Last Modified</h4>
                <p className="text-sm text-gray-700">
                  {new Date(document.updatedAt || document.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={id}
        onShareUpdate={handleShareUpdate}
      />
    </div>
  );
};

export default DocumentDetails;
