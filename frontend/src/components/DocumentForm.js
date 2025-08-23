import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // snow theme (like docs)

const DocumentForm = ({ onDocumentCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : null;
            
            const { data } = await axios.post('http://localhost:5000/api/documents', 
                { title, content }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            setSuccessMessage('Document created successfully!');
            setTitle('');
            setContent('');
            
            // Call the callback to refresh documents in parent component
            if (onDocumentCreated) {
                onDocumentCreated();
            }
            
            // Show success message for 2 seconds then navigate
            setTimeout(() => {
                navigate(`/document/${data._id}`);
            }, 2000);
            
        } catch (error) {
            console.error('Failed to create document:', error);
            setErrorMessage('Failed to create document. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Document</h2>
            
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errorMessage}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Document Title
                    </label>
                    <input 
                        type="text" 
                        id="title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-lg" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        placeholder="Enter document title..."
                        disabled={isLoading}
                    />
                </div>
                
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            style={{ minHeight: '300px' }}
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, 3, false] }],
                                    ["bold", "italic", "underline", "strike"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link", "image"],
                                    [{ align: [] }],
                                    [{ color: [] }, { background: [] }],
                                    ["blockquote", "code-block"],
                                    ["clean"],
                                ],
                            }}
                            formats={[
                                "header",
                                "bold", "italic", "underline", "strike",
                                "list", "bullet",
                                "link", "image",
                                "align",
                                "color", "background",
                                "blockquote", "code-block",
                            ]}
                            placeholder="Start writing your document..."
                            readOnly={isLoading}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button 
                        type="button"
                        onClick={() => {
                            setTitle('');
                            setContent('');
                            setSuccessMessage('');
                            setErrorMessage('');
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                        disabled={isLoading}
                    >
                        Clear
                    </button>
                    <button 
                        type="submit" 
                        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        disabled={isLoading || !title.trim()}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Create Document</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentForm;