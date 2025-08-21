import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Brand */}
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          CollabTool
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* Links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } w-full md:flex md:items-center md:w-auto`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 mt-3 md:mt-0">
            <li>
              <Link
                to="/dashboard"
                className="block py-2 text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
            </li>
          
            <li>
              <Link 
    to={`/editor/${document._id}`} 
    className="btn btn-primary btn-sm"
>
    Open Document
</Link>
            </li>
          </ul>

          {/* Right side (Auth buttons) */}
          {user ? (
            <div className="mt-3 md:mt-0 md:ml-6">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {user.username} • Logout
              </button>
            </div>
          ) : (
            <ul className="flex flex-col md:flex-row md:space-x-6 mt-3 md:mt-0 md:ml-6">
              <li>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                >
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
