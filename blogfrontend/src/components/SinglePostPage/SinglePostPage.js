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
    const fetchAuthor = async () => {
      if (post?.author_id && (!author || author.id !== post.author_id)) {
        await getAuthor(parseInt(post.author_id));
      }
    };
    fetchAuthor();
  }, [post, author, getAuthor]);

  useEffect(() => {
    if (id) {
      getPost(id);
    }
  }, [id, getPost]);

  return (
    <div className="container mt-5">
      {post ? (
        <div className="post-container">
          {author && (
            <div className="author-info d-flex align-items-center mb-4">
              <div className="author-avatar">
                <img
                  src={
                    author.img
                      ? `https://localhost-blog.onrender.com/${author.img}`
                      : "https://localhost-blog.onrender.com/media/author_images/default.jpg"
                  }
                  alt={author.name}
                  className="rounded-circle"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              </div>
              {console.log("ppp", author)}
              <div className="author-details ms-3">
                <Link
                  className="text-decoration-none"
                  to={`/userpage/${author.id}`}
                >
                  <h2 className="mb-0">{author.user}</h2>
                </Link>
              </div>
            </div>
          )}

          {post.img && (
            <div className="post-image mb-4">
              <img
                src={post.img}
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
