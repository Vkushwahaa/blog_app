import { useContext, useEffect } from "react";
import AppContext from "../../contextApi/AppContext";
import { useParams } from "react-router-dom";
import Comment from "../Comments/Comments";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SinglePostPage.css";

const SinglePostPage = () => {
  const { id } = useParams();
  const { post, getPost, author, getAuthor } = useContext(AppContext);

  useEffect(() => {
    if (id) {
      getPost(id);
    }
  }, [id, getPost]);

  useEffect(() => {
    if (post?.author_id && (!author || author.id !== post.author_id)) {
      getAuthor(parseInt(post.author_id));
    }
  }, [post, author, getAuthor]);

  const authorImg = author?.img
    ? `https://localhost-blog.onrender.com${author.img.startsWith("/") ? author.img : "/" + author.img}`
    : "https://localhost-blog.onrender.com/media/author_images/default.jpg";

  const postImg = post?.img?.startsWith("http")
    ? post.img
    : `https://localhost-blog.onrender.com${post.img?.startsWith("/") ? post.img : "/" + post.img}`;

  return (
    <div className="container mt-5">
      {post ? (
        <div className="post-container">
          {author && (
            <div className="author-info d-flex align-items-center mb-4" style={{ display: "flex", alignItems: "center" }}>
              <div className="author-avatar" style={{ marginRight: "15px" }}>
                <img
                  src={authorImg}
                  alt={author.name}
                  className="rounded-circle"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              </div>
              <div className="author-details">
                <Link
                  className="text-decoration-none"
                  to={`/userpage/${author.id}`}
                >
                  <h2 className="mb-0">{author.name}</h2>
                </Link>
              </div>
            </div>
          )}

          {post.img && (
            <div className="post-image mb-4">
              <img
                src={postImg}
                alt="Featured"
                className="w-100 img-fluid rounded"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>
          )}

          <div className="post-title mb-4">
            <h1>{post.title}</h1>
          </div>

          <div
            className="post-body mb-4"
            dangerouslySetInnerHTML={{
              __html: post.body,
            }}
          />

          <div className="post-meta text-muted mb-4">
            <p>
              <strong>Category:</strong> {post.category_name}
            </p>
          </div>

          <div className="comments-section mt-5">
            {post && <Comment postId={post.id} />}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SinglePostPage;
