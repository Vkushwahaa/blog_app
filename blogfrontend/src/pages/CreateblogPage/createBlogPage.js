import React, { useContext, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AppContext from "../../contextApi/AppContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CreateBlogPage.css";

const CreateBlogPage = () => {
  const { createPost, categories } = useContext(AppContext);
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    category: "",
    published: false,
    img: null,
  });
  const [errors, setErrors] = useState({});

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, img: file });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!newPost.title.trim()) {
      newErrors.title = "Title is required.";
    }
    if (!newPost.body.trim()) {
      newErrors.body = "Content is required.";
    }
    if (!newPost.category) {
      newErrors.category = "Category is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      await createPost(newPost);
      alert("Post submitted successfully!");
      setNewPost({
        title: "",
        body: "",
        category: "",
        published: false,
        img: null,
      });

      setErrors({});
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
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

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-body p-0">
          <div className="upload-image-container position-relative">
            {newPost.img ? (
              <img
                src={URL.createObjectURL(newPost.img)}
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

          <div className="p-4">
            <input
              type="text"
              className={`form-control border-0 fs-3 fw-bold mb-3 ${
                errors.title ? "is-invalid" : ""
              }`}
              placeholder="Enter the title here..."
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
              required
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="p-4">
            <ReactQuill
              placeholder="Write your content here..."
              value={newPost.body}
              onChange={(value) => setNewPost({ ...newPost, body: value })}
              modules={modules}
              style={{ minHeight: "300px" }}
            />
            {errors.body && <div className="text-danger">{errors.body}</div>}
          </div>

          <div className="p-4">
            <label className="form-label">Category</label>
            <select
              className={`form-select mb-3 ${
                errors.category ? "is-invalid" : ""
              }`}
              value={newPost.category}
              onChange={(e) =>
                setNewPost({ ...newPost, category: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select a Category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <div className="invalid-feedback">{errors.category}</div>
            )}
          </div>

          <div className="p-4 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="publishCheckbox"
                checked={newPost.published}
                onChange={(e) =>
                  setNewPost({ ...newPost, published: e.target.checked })
                }
              />
              <label className="form-check-label" htmlFor="publishCheckbox">
                Publish
              </label>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Submit Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
