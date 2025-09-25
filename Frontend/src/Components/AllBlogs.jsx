import React, { useEffect } from "react";
import { useBlogContext } from "../Context/BlogContext";
import { Link } from "react-router-dom";

const AllBlogs = () => {
  const { blogs, fetchAllBlogs } = useBlogContext();

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Latest Blogs</h2>
      <p className="text-center text-gray-500 mb-10">
        Real insights and helpful tips from verified doctors.
      </p>

      {blogs.length === 0 ? (
        <p className="text-center text-sm text-gray-500">No blogs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blogs/${blog._id}`}
              className="w-full max-w-xs bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 ease-in-out"
            >
              <div className="p-4">
                <img
                  src={blog.bannerImage}
                  alt={blog.title}
                  className="w-full h-36 object-cover rounded-md mb-3 transition duration-300 hover:brightness-105"
                />
                <h3 className="text-base font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                  {blog.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                {`Dr. ${blog.doctorId?.username || "Unknown Doctor"}`}
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">5 minute read</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBlogs;
