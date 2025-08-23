import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Clock, Plus, Menu, X, LogOut, User, ChevronLeft, ChevronRight, Search } from "lucide-react";

const Navbar = ({ onSectionChange = () => {}, onSearchChange = () => {}, searchTerm = "", setSearchTerm = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    setIsOpen(false);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    onSectionChange(section);
    setIsOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onSearchChange(value);
    if (value) {
      setActiveSection('search');
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg z-40 transition-all duration-300 overflow-y-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
          <div className="flex items-center space-x-3">
            
             
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-800 font-seenonim">NoteSphere</span>
            )}
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className={`p-4 flex-1 ${isCollapsed ? 'px-2' : ''}`}>
          <ul className="space-y-2">
            {/* Home Button */}
            <li>
              <button
                onClick={() => handleSectionChange('home')}
                className={`w-full flex items-center rounded-lg transition ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeSection === 'home'
                    ? "bg-gray-100 text-gray-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={isCollapsed ? "Home" : ""}
              >
                <Home size={20} />
                {!isCollapsed && <span>Home</span>}
              </button>
            </li>

            {/* New Document Button */}
            <li>
              <button
                onClick={() => handleSectionChange('new-document')}
                className={`w-full flex items-center rounded-lg transition ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeSection === 'new-document'
                    ? "bg-gray-100 text-gray-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={isCollapsed ? "New Document" : ""}
              >
                <Plus size={20} />
                {!isCollapsed && <span>New Document</span>}
              </button>
            </li>

            {/* Recent Files Button */}
            <li>
              <button
                onClick={() => handleSectionChange('recent')}
                className={`w-full flex items-center rounded-lg transition ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeSection === 'recent'
                    ? "bg-gray-100 text-gray-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={isCollapsed ? "Recent Files" : ""}
              >
                <Clock size={20} />
                {!isCollapsed && <span>Recent Files</span>}
              </button>
            </li>

            {/* All Documents Button */}
            <li>
              <button
                onClick={() => handleSectionChange('all-documents')}
                className={`w-full flex items-center rounded-lg transition ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeSection === 'all-documents'
                    ? "bg-gray-100 text-gray-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={isCollapsed ? "All Documents" : ""}
              >
                <FileText size={20} />
                {!isCollapsed && <span>All Documents</span>}
              </button>
            </li>
          </ul>
        </nav>

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
                  onClick={() => setIsOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2 text-center bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  REGISTER
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;