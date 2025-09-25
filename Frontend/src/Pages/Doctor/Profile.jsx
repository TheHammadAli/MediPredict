import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import ProfileContext from "../../Context/ProfileContext";
import AppContext from "../../Context/AppContext"; // to get logged-in user

const Profile = () => {
  const { user } = useContext(AppContext);
  const { uploadProfile, getProfileByEmail, updateProfile, loading, uploadError } =
    useContext(ProfileContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    speciality: "",
    education: "",
    experience: "",
    fees: "",
    address1: "",
    address2: "",
    about: "",
    timing: "",
    daysAvailable: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  // ✅ Load profile if exists
  useEffect(() => {
    const fetchExisting = async () => {
      if (user?.email) {
        const profile = await getProfileByEmail(user.email);
        if (profile) {
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            speciality: profile.speciality || "",
            education: profile.education || "",
            experience: profile.experience || "",
            fees: profile.fees || "",
            address1: profile.address1 || "",
            address2: profile.address2 || "",
            about: profile.about || "",
            timing: profile.timing || "",
            daysAvailable: profile.daysAvailable || [],
          });
          setImagePreview(profile.imageUrl || null);
          setIsExistingProfile(true);
        } else {
          setFormData((prev) => ({ ...prev, email: user.email })); // set email at least
        }
      }
    };

    fetchExisting();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, v));
      } else {
        data.append(key, value);
      }
    });

    if (imageFile) {
      data.append("image", imageFile);
    }

    let res;
    if (isExistingProfile) {
      res = await updateProfile(formData.email, data);
    } else {
      res = await uploadProfile(data);
    }

    if (res && res.doctor) {
      toast.success("Doctor profile saved successfully!");
      setImageFile(null);
      setIsExistingProfile(true);
    } else {
      toast.error("Failed to save profile.");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Doctor Profile</h2>

      <div className="max-w-5xl mx-auto bg-white shadow-lg p-8 rounded-lg">
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="mb-8 flex items-start justify-start flex-col">
            <label htmlFor="imageUpload" className="cursor-pointer">
              <div className="w-28 h-28 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center mb-2 shadow-md">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400" />
                )}
              </div>
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-gray-500 text-sm">Upload profile picture</span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-base">
            <div>
              <label className="block mb-1 text-gray-600">Doctor name</label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Speciality</label>
              <select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select speciality</option>
                <option>General physician</option>
                <option>Cardiologist</option>
                <option>Neurologist</option>
                <option>Dermatologist</option>
                <option>Diabetologist</option>
                <option>Pediatrician</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Doctor Email</label>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Education</label>
              <input
                type="text"
                name="education"
                placeholder="Education"
                value={formData.education}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Address</label>
              <input
                type="text"
                name="address1"
                placeholder="Address 1"
                value={formData.address1}
                onChange={handleChange}
                className="w-full max-w-sm mb-2 rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="address2"
                placeholder="Address 2"
                value={formData.address2}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Experience</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select experience</option>
                <option>1-2 years</option>
                <option>3-5 years</option>
                <option>6-10 years</option>
                <option>10+ years</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Available Timing</label>
              <input
                type="text"
                name="timing"
                placeholder="e.g. 10:00 AM - 2:00 PM"
                value={formData.timing}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-600">Available Days</label>
              <div className="flex flex-wrap gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={day}
                      checked={formData.daysAvailable.includes(day)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          daysAvailable: checked
                            ? [...prev.daysAvailable, value]
                            : prev.daysAvailable.filter((d) => d !== value),
                        }));
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <div>
  <label className="block mb-1 text-gray-600">License Number</label>
  <input
    type="text"
    name="licenseNumber"
    placeholder="Enter your license number"
    value={formData.licenseNumber}
    onChange={handleChange}
    className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>


            <div>
              <label className="block mb-1 text-gray-600">Fees</label>
              <input
                type="text"
                name="fees"
                placeholder="Your fees"
                value={formData.fees}
                onChange={handleChange}
                className="w-full max-w-sm rounded px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          

          {/* About Me */}
          <div className="mb-6 text-base">
            <label className="block mb-1 text-gray-600">About me</label>
            <textarea
              name="about"
              rows="4"
              placeholder="Write about yourself"
              value={formData.about}
              onChange={handleChange}
              className="w-full max-w-xl rounded px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="text-left">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition text-base"
            >
              {loading ? "Saving..." : isExistingProfile ? "Update Profile" : "Add Doctor"}
            </button>
            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;
