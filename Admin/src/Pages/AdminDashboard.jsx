import React, { useContext } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faStethoscope,
  faUser,
  faComments,
  faBullhorn,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import AppContext from "../../../Frontend/src/Context/AppContext";
import { toast } from "sonner";
import logo from "../assets/Logo- Blue.svg";

const AdminDashboard = () => {
  const { logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/admin-login");
  };

  const navItemClasses = (path) =>
    `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 rounded-md cursor-pointer
     ${location.pathname === path
        ? "bg-blue-100 text-blue-600 font-semibold"
        : "text-gray-700 hover:bg-gray-100"
     }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-10 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="MediPredict Logo" className="h-4 w-auto sm:h-6 object-contain" />
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
          Logout
        </button>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
          <nav className="py-6 px-4">
            <ul className="space-y-2">
              <li>
                <div onClick={() => navigate("/Admin")} className={navItemClasses("/Admin")}>
                  <FontAwesomeIcon icon={faHouse} size="lg"/>
                  Dashboard
                </div>
              </li>
              <li>
                <div onClick={() => navigate("/admin/doctors")} className={navItemClasses("/admin/doctors")}>
                  <FontAwesomeIcon icon={faStethoscope} size="lg" />
                  Doctors
                </div>
              </li>
              <li>
                <div onClick={() => navigate("/admin/patients")} className={navItemClasses("/admin/patients")}>
                  <FontAwesomeIcon icon={faUser} size="lg" />
                  Patients
                </div>
              </li>
              <li>
                <div onClick={() => navigate("/admin/feedbacks")} className={navItemClasses("/admin/feedbacks")}>
                  <FontAwesomeIcon icon={faComments} size="lg"/>
                  Feedbacks
                </div>
              </li>
              <li>
                <div onClick={() => navigate("/admin/announcements")} className={navItemClasses("/admin/announcements")}>
                  <FontAwesomeIcon icon={faBullhorn} size="lg" />
                  Announcements
                </div>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
