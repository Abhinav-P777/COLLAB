import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import DocumentForm from './DocumentForm';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [currentSection, setCurrentSection] = useState('home');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user ? user.token : null;
                const { data } = await axios.get('http://localhost:5000/api/documents', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDocuments(data);
                
                // Set recent documents (last 10, sorted by updatedAt or createdAt)
                const recent = data
                    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                    .slice(0, 10);
                setRecentDocuments(recent);
                
                console.log(data)
            } catch (error) {
                console.error('Failed to fetch documents:', error);
                navigate('/');
            }
        };
        fetchDocuments();
    }, [navigate]);

    // Handle search functionality
    useEffect(() => {
        if (searchTerm) {
            const filtered = documents.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDocuments(filtered);
        } else {
            setFilteredDocuments([]);
        }
    }, [searchTerm, documents]);

    const handleSectionChange = (section) => {
        setCurrentSection(section);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        if (term) {
            setCurrentSection('search');
        }
    };

    const handleDocumentCreated = async () => {
        // Refresh documents after creating a new one
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : null;
            const { data } = await axios.get('http://localhost:5000/api/documents', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDocuments(data);
            
            // Update recent documents
            const recent = data
                .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                .slice(0,3);
            setRecentDocuments(recent);
            
            // Switch to home view
            setCurrentSection('home');
        } catch (error) {
            console.error('Failed to refresh documents:', error);
        }
    };

    const renderDocumentGrid = (docs, title) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {docs.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No documents found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {docs.map((doc) => (
                        <div key={doc._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-4">
                                <h5 className="font-semibold text-gray-900 mb-2 truncate">{doc.title}</h5>
                                <p className="text-sm text-gray-600 mb-3">
                                    Created: {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                                {doc.updatedAt && doc.updatedAt !== doc.createdAt && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                                    </p>
                                )}
                                <Link 
                                    to={`/document/${doc._id}`} 
                                    className="inline-block w-full px-4 py-2 bg-gray-800 text-white text-center rounded-lg hover:bg-gray-700 transition-colors duration-200 no-underline text-sm font-medium"
                                >
                                    Open Document
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMainContent = () => {
        switch (currentSection) {
            case 'home':
                return (
                    <div className="space-y-8 font-libre">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to NoteSphere</h2>
                            <p className="text--600 mb-4">Your collaborative document workspace</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2 ">Total Documents</h3>
                                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Recent Files</h3>
                                    <p className="text-2xl font-bold text-gray-900">{recentDocuments.length}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
                                    <button 
                                        onClick={() => setCurrentSection('new-document')}
                                        className="text-sm bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        New Document
                                    </button>
                                </div>
                            </div>
                        </div>
                        {recentDocuments.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                {renderDocumentGrid(recentDocuments.slice(0, 6), "Recent Documents")}
                            </div>
                        )}
                    </div>
                );
            
            case 'new-document':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <DocumentForm onDocumentCreated={handleDocumentCreated} />
                    </div>
                );
            
            case 'recent':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {renderDocumentGrid(recentDocuments, "Recent Files")}
                    </div>
                );
            
            case 'all-documents':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {renderDocumentGrid(documents, "All Documents")}
                    </div>
                );
            
            case 'search':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {renderDocumentGrid(
                            filteredDocuments, 
                            searchTerm ? `Search Results for "${searchTerm}"` : "Search Documents"
                        )}
                    </div>
                );
            
            default:
                return renderMainContent();
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Navbar 
                onSectionChange={handleSectionChange}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <div className="flex-1 ml-80 p-6">
                <div className="max-w-7xl mx-auto">
                    {renderMainContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;