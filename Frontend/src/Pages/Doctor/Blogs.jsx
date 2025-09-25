import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useBlogContext } from "../../Context/BlogContext";

const Blogs = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [content, setContent] = useState("");
  const { uploadBlog } = useBlogContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("bannerImage", image);
    formData.append("content", content);

    await uploadBlog(formData);

    // Reset form
    setTitle("");
    setImage(null);
    setContent("");
  };

  return (
    <>
      <h2 className="text-2xl text-blue-700 font-bold mb-4">Upload Blog</h2>
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">Blog Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter blog title"
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">Blog Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full cursor-pointer text-gray-600"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">Blog Content</label>
            <ReactQuill
              value={content}
              onChange={setContent}
              placeholder="Write your blog content here..."
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              className="rounded-lg overflow-hidden"
              style={{ minHeight: "250px" }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            Submit Blog
          </button>
        </form>
      </div>
    </>
  );
};

export default Blogs;
