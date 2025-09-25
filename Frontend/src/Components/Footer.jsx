import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faXTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import logoW from "../assets/Logo-White.svg";

const Footer = () => {
  return (
    <footer className="bg-[#0d1117] text-white pt-14 pb-8 rounded-tl-xl rounded-tr-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* ✅ Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-3">
              <img src={logoW} alt="MediPredict" className="h-8" />
              
            </Link>
            <p className="text-gray-400 mt-4 text-sm leading-relaxed">
              Empowering health with AI. Consult online, access medical expertise, and join a wellness community.
            </p>
            <div className="flex space-x-4 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-all">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-all">
                <FontAwesomeIcon icon={faXTwitter} size="lg" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-all">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
            </div>
          </div>

          {/* ✅ Grouped: Services + Support side-by-side on mobile */}
          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-10">
            {/* Our Services */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-400 mb-4">Our Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white transition">Online Consultation</li>
                <li className="hover:text-white transition">Specialist Doctors</li>
                <li className="hover:text-white transition">Health Education</li>
                <li className="hover:text-white transition">Community Forum</li>
              </ul>
            </div>

            {/* Support */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-400 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>

          {/* ✅ Company */}
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition">Our Doctors</Link></li>
              <li><Link to="/testimonial" className="hover:text-white transition">Testimonials</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ Copyright */}
      <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-800 pt-6 px-4">
        &copy; {new Date().getFullYear()} MediPredict. Designed with ❤️ in Pakistan. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
