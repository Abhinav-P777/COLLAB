import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Clock, Plus, Menu, X, LogOut, User, ChevronLeft, ChevronRight, Search } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false); // Direct state management
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Document-related state
  const [documents, setDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  // Auto-collapse on document routes
  useEffect(() => {
    if (location.pathname.includes('/document/') && location.pathname !== '/dashboard') {
      setIsCollapsed(true);
    }
  }, [location.pathname]);


  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      try {
        const token = user.token;
        const { data } = await axios.get("http://localhost:5000/api/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDocuments(data);
        
        // Get recent documents (last 5, sorted by date)
        const recent = data
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 5);
        setRecentDocuments(recent);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    
    fetchDocuments();
  }, [user]);

  // Filter documents based on search term
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    setIsMobileOpen(false);
  };

  const handleNewDocument = () => {
    setIsCollapsed(true);
    navigate("/document/new");
    setIsMobileOpen(false);
  };

  const handleDocumentClick = (docId) => {
    navigate(`/document/${docId}`);
    setIsMobileOpen(false);
    setSearchTerm("");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg z-40 transition-all duration-300 overflow-y-auto ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${isCollapsed ? "w-16" : "w-80"}`}>
        
        {/* Collapse Toggle Button (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-4' : ''}`}>
          <Link to="/dashboard" className="flex items-center space-x-3 no-underline" onClick={() => setIsCollapsed(false)}>
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-800 no-underline">Collabn</span>
            )}
          </Link>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isCollapsed && searchTerm && (
          <div className="border-b border-gray-200 max-h-60 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Search Results</h3>
              {filteredDocuments.length > 0 ? (
                <div className="space-y-1">
                  {filteredDocuments.slice(0, 5).map((doc) => (
                    <button
                      key={doc._id}
                      onClick={() => handleDocumentClick(doc._id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText size={14} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents found</p>
              )}
            </div>
          </div>
        )}

        {/* Create New Document Button */}
        <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={handleNewDocument}
            className={`w-full flex items-center bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
            }`}
            title={isCollapsed ? "New Document" : ""}
          >
            <Plus size={20} />
            {!isCollapsed && <span className="font-medium">New Document</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={`p-4 flex-1 ${isCollapsed ? 'px-2' : ''}`}>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-lg transition no-underline ${
                      isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                    } ${
                      isActive(item.path)
                        ? "bg-gray-100 text-gray-800 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                    onClick={() => {
                      setIsMobileOpen(false);
                      if (item.path === "/dashboard") setIsCollapsed(false);
                    }}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Recent Documents Section */}
        {!isCollapsed && recentDocuments.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
              <Clock size={16} className="mr-2" />
              Recent Files
            </h3>
            <div className="space-y-1">
              {recentDocuments.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleDocumentClick(doc._id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-2">
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Documents Section */}
        {!isCollapsed && documents.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
              <FileText size={16} className="mr-2" />
              All Documents ({documents.length})
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleDocumentClick(doc._id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-2">
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Section */}
        <div className={`p-4 border-t border-gray-200 mt-auto ${isCollapsed ? 'px-2' : ''}`}>
          {user ? (
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <User size={18} />
                  <span className="text-sm text-gray-700 font-medium">{user.username}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-2'
                }`}
                title={isCollapsed ? "Logout" : ""}
              >
                <LogOut size={18} />
                {!isCollapsed && <span className="text-sm">Logout</span>}
              </button>
            </div>
          ) : (
            !isCollapsed && (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition no-underline"
                  onClick={() => setIsMobileOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2 text-center bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition no-underline"
                  onClick={() => setIsMobileOpen(false)}
                >
                  REGISTER
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
