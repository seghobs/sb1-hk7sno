import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle, User, LogOut } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">AnonymChat</Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/messages" className="p-2 hover:bg-gray-100 rounded-full">
              <MessageCircle className="w-6 h-6" />
            </Link>
            <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full">
              <User className="w-6 h-6" />
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;