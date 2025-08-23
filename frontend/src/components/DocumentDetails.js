import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDocumentById, updateDocument, deleteDocument } from '../services/documentService';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Save, Trash2, Users, Clock, Share2 } from 'lucide-react';
import SimpleNavbar from './SimpleNavbar';
import ShareDocumentModal from '../components/ShareDocumentModal';

const DocumentDetails = () => {
  const socket = io('http://localhost:5000');
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedUsersCount, setSharedUsersCount] = useState(0);

  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await getDocumentById(id);
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setLastSaved(new Date(doc.updatedAt || doc.createdAt));
        setSharedUsersCount(doc.sharedWith ? doc.sharedWith.length : 0);
      } catch (error) {
        setError('Failed to fetch document');
      }
    };
    fetchDocument();
  }, [id]);

  useEffect(() => {
    socket.emit('joinDocument', id);

    socket.on('receiveUpdate', (updatedData) => {
      if (updatedData.title) setTitle(updatedData.title);
      if (updatedData.content) setContent(updatedData.content);
    });

    return () => {
      socket.disconnect();
    };
  }, [id, socket]);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateDocument(id, { title, content });
      socket.emit('documentUpdate', { documentId: id, title, content });
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
    socket.emit('documentUpdate', { documentId: id, title: newTitle, content });
  };

  const handleContentChange = (value) => {
    setContent(value);
    socket.emit('documentUpdate', { documentId: id, title, content: value });
  };

  const handleShareUpdate = () => {
    // Refresh shared users count
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
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Collaborative editing enabled</span>
                  </div>
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
          </div>

          {/* Document Stats */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
