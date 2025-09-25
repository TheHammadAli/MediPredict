import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes,faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import AppContext from "../Context/AppContext";
import logo from "../assets/Logo- Blue.svg";

const Navbar = () => {
  const { user, logout, loadingUser } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };
  if (loadingUser) return null;

  const navLinks = [
    { name: "Home", link: "/dashboard" },
    ...(user ? [{ name: "All Doctor", link: "/doctors" }] : []),
    { name: "About", link: "/about" },
    { name: "Contact", link: "/contact" },
    { name: "Blog", link: "/all-blogs" },
    { name: "FAQs", link: "/faqs" },
    ...(user ? [{ name: "Appointments", link: "/appointments" }] : []),
    ...(user ? [{ name: "Messages", link: "/messages" }] : []),
    
  ];

  // ✅ Auth Button Fragment
  const AuthButtons = ({ mobile = false }) => {
    if (loadingUser) return null;
  
    if (user) {
      return (
        <button
          onClick={handleLogout}
          className={`${
            mobile ? "block w-full text-center" : "inline-flex items-center"
          } bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition`}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </button>
      );
    } else {
      return (
        <Link
          to="/signup"
          onClick={() => setIsOpen(false)}
          className={`${
            mobile ? "block w-full text-center" : ""
          } bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition`}
        >
          Sign Up
        </Link>
      );
    }
  };
  

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={logo}
              alt="MediPredict Logo"
              className="h-4 w-auto sm:h-6 object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
            {navLinks.map((item, i) => (
              <li key={i} className="relative group">
                <Link
                  to={item.link}
                  className="relative text-gray-700 hover:text-blue-600 transition duration-200 
                    after:content-[''] after:absolute after:left-0 after:-bottom-1 
                    after:h-[2px] after:w-0 hover:after:w-full 
                    after:bg-blue-600 after:transition-all"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            <AuthButtons />
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-700" onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <button
          className="absolute top-4 right-4 text-gray-700 text-2xl"
          onClick={() => setIsOpen(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <ul className="flex flex-col items-start p-6 space-y-6 text-gray-700 text-lg font-medium mt-10">
          {navLinks.map((item, i) => (
            <li key={i}>
              <Link
                to={item.link}
                className="hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Auth Button */}
        <div className="px-6 mt-6">
          <AuthButtons mobile />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
