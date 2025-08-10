import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Bio from "../../components/Bio/Bio";
import AppContext from "../../contextApi/AppContext";
import { Link } from "react-router-dom";
import AuthContext from "../../contextApi/AuthContext";
import "react-quill/dist/quill.snow.css";

import "./UserPage.css";
const UserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    userPost,
    hasMorePost,
    loadingPost,
    getUserPostList,
    setUserPost,
    setHasMorePost,
    setNextPostPage,
    getAuthor,
  } = useContext(AppContext);
  const { user, author } = useContext(AuthContext);

  // Function to fetch posts manually
  const handleFetchPosts = async () => {
    try {
      if (id) {
        await getUserPostList(parseInt(id));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Reset posts when changing users
  const resetPosts = () => {
    setUserPost([]);
    setHasMorePost(true);
    setNextPostPage(null);
  };
  useEffect(() => {
    resetPosts();
    if (user && user.user_id) {
      getAuthor(user.user_id).catch((err) =>
        console.error("Failed to fetch author:", err)
      );
    }

    const isAuthor = user && parseInt(user?.user_id) === parseInt(id);
    getUserPostList(id, isAuthor);
  }, [id, user]);

  // Handle user change (triggered manually)
  const handleUserChange = () => {
    resetPosts();
    handleFetchPosts();
  };

  // Navigate to update blog page
  const handleUpdatePost = (postId) => {
    navigate(`/updateBlog/${postId}`);
  };

  return (
    <div className="container mt-5">
      {/* User Bio */}
      <div className="mb-4">
        <Bio id={parseInt(id)} />
      </div>

      {/* User Posts Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>User Posts</h3>
        <button className="btn btn-primary" onClick={handleUserChange}>
          Show Posts
        </button>
      </div>

      {/* Posts List */}
      <div className="card-columns">
        {userPost.length > 0 ? (
          userPost.map((post) => (
            <div className="card shadow-lg rounded" key={post.id}>
              {console.log("post from userpage", post)}
              {post.img ? (
                <img
                  src={post.img}
                  alt={post.title || "Post Image"}
                  className="w-100 img-fluid rounded"
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: "10px" }}></div>
              )}
              <div className="card-body">
                <h5 className="card-title text-black">{post.title}</h5>
                <p className="card-text">Published: {String(post.published)}</p>
                <div className="card-text">
                  <div
                    className="post-body ql-editor"
                    dangerouslySetInnerHTML={{
                      __html:
                        post.body.length > 150
                          ? `${post.body.substring(0, 150)}...`
                          : post.body,
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between">
                  {post.published && (
                    <Link to={`/${post.id}`} className="btn btn-info btn-sm">
                      View Post
                    </Link>
                  )}

                  {parseInt(user?.user_id) === parseInt(id) && (
                    <button
                      onClick={() => handleUpdatePost(post.id)}
                      className="btn btn-warning btn-sm"
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No posts available.</p>
        )}
      </div>

      {/* Loading & End of Posts */}
      {loadingPost && (
        <p className="text-center text-primary">Loading posts...</p>
      )}
      {!hasMorePost && userPost.length > 0 && (
        <p className="text-center text-muted">No more posts to load.</p>
      )}
    </div>
  );
};

export default UserPage;
