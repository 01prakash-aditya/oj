import { Link } from "react-router-dom";
import logo from "/src/assets/logo.png"; 
import { useSelector } from "react-redux";
import { useState } from "react";

export default function Header() {
  const {currentUser} = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-slate-300">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8" />
          <h1 className="font-bold text-lg">CodeKhana</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-4">
          <li>
            <Link className="hover:text-blue-500" to="/">
              Home
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500" to="/compiler">
              Compiler
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500" to="/problemset">
              ProblemSet
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500" to="/community">
              Community
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500" to="/about">
              About
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500" to="/contribute">
              Contribute
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500 flex items-center" to="/profile">
              {currentUser ? (
                <img
                  src={currentUser.profilePicture || 'https://tableconvert.com/images/avatar.png'}
                  alt="Profile"
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                "Sign In"
              )}
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Link className="hover:text-blue-500 flex items-center" to="/profile">
            {currentUser ? (
              <img
                src={currentUser.profilePicture || 'https://tableconvert.com/images/avatar.png'}
                alt="Profile"
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              "Sign In"
            )}
          </Link>
          <button
            onClick={toggleMenu}
            className="flex items-center gap-1 p-2 hover:bg-slate-400 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1">
              <span className="block w-5 h-0.5 bg-gray-800"></span>
              <span className="block w-5 h-0.5 bg-gray-800"></span>
              <span className="block w-5 h-0.5 bg-gray-800"></span>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`md:hidden bg-slate-300 border-t border-slate-400 transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <ul className="flex flex-col p-3 space-y-2">
          <li>
            <Link 
              className="block hover:text-blue-500 hover:bg-slate-400 p-2 rounded-md transition-colors" 
              to="/"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              className="block hover:text-blue-500 hover:bg-slate-400 p-2 rounded-md transition-colors" 
              to="/compiler"
              onClick={() => setIsMenuOpen(false)}
            >
              Compiler
            </Link>
          </li>
          <li>
            <Link 
              className="block hover:text-blue-500 hover:bg-slate-400 p-2 rounded-md transition-colors" 
              to="/problemset"
              onClick={() => setIsMenuOpen(false)}
            >
              ProblemSet
            </Link>
          </li>
          <li>
            <Link 
              className="block hover:text-blue-500 hover:bg-slate-400 p-2 rounded-md transition-colors" 
              to="/community"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
          </li>
          <li>
            <Link 
              className="block hover:text-blue-500 hover:bg-slate-400 p-2 rounded-md transition-colors" 
              to="/about"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              className="block hover:text-blue-500 hover:bg-slate-400 p-2 rounded-md transition-colors" 
              to="/contribute"
              onClick={() => setIsMenuOpen(false)}
            >
              Contribute
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
