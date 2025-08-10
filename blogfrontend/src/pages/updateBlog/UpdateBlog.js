import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AppContext from "../../contextApi/AppContext";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UpdateBlogPage.css";

const UpdateBlogPage = () => {
  const { id } = useParams();
  const {
    updatePost,
    getPostUpdate,
    categories,
    uPost,
    deletePost,
    getUserPostList,
  } = useContext(AppContext);

  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    category: "",
    published: false,
    img: null,
  });

  // New loading state:
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNewPost({
      title: "",
      body: "",
      category: "",
      published: false,
      img: null,
    });

    const handleGetPost = async () => {
      try {
        await getPostUpdate(id);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    handleGetPost();
  }, [id, getPostUpdate]);

  useEffect(() => {
    if (uPost) {
      setNewPost({
        title: uPost.title || "",
        body: uPost.body || "",
        category: uPost.category_name || "",
        published: uPost.published || false,
        img: uPost.img || null,
      });
    }
  }, [uPost]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, img: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePost(newPost, id);
      alert("Post updated successfully!");
      await getUserPostList();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handledelete = async (e) => {
    e.preventDefault();
    try {
      await deletePost(id);
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading post...</span>
        </div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!uPost) {
    return (
      <div className="container mt-4 text-center">
        <p>Post data not available. Please refresh or login again.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-body p-0">
          {/* Image Upload */}
          <div className="upload-image-container position-relative">
            {newPost.img ? (
              <img
                src={
                  newPost.img instanceof File
                    ? URL.createObjectURL(newPost.img)
                    : newPost.img?.startsWith("http")
                    ? newPost.img
                    : `https://localhost-blog.onrender.com${
                        newPost.img?.startsWith("/")
                          ? newPost.img
                          : "/" + newPost.img
                      }`
                }
                alt="Featured"
                className="w-100 img-fluid"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            ) : (
              <div className="upload-placeholder text-center py-5">
                <label className="btn btn-outline-secondary">
                  Upload Featured Image
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="p-4">
            <input
              type="text"
              className="form-control border-0 fs-3 fw-bold mb-3"
              placeholder="Enter the title here..."
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
              required
            />
          </div>

          {/* Rich Text Editor */}
          <div className="p-4">
            <ReactQuill
              placeholder="Write your content here..."
              value={newPost.body}
              onChange={(value) => setNewPost({ ...newPost, body: value })}
              modules={modules}
              style={{ minHeight: "300px" }}
            />
          </div>

          {/* Category Dropdown */}
          <div className="p-4">
            <label className="form-label">Category</label>
            <select
              className="form-select mb-3"
              value={newPost.category}
              onChange={(e) =>
                setNewPost({ ...newPost, category: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select a Category
              </option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>Loading categories...</option>
              )}
            </select>
          </div>

          {/* Publish Toggle and Buttons */}
          <div className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="form-check mb-3 mb-md-0">
              <input
                type="checkbox"
                className="form-check-input"
                id="publishCheckbox"
                checked={newPost.published}
                onChange={(e) =>
                  setNewPost({ ...newPost, published: e.target.checked })
                }
              />
              <label
                className="form-check-label ms-2"
                htmlFor="publishCheckbox"
              >
                Publish
              </label>
            </div>

            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn1 btn-danger1"
                onClick={handledelete}
              >
                Delete Post
              </button>
              <button
                type="submit"
                className="btn1 btn-primary1"
                onClick={handleSubmit}
              >
                Update Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlogPage;
