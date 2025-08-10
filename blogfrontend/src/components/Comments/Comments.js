import { useContext, useEffect, useState } from "react";
import AuthContext from "../../contextApi/AuthContext";
import AppContext from "../../contextApi/AppContext";
import "./Comments.css";
const Comment = ({ postId }) => {
  const {
    getComments,
    createComment,
    comment,
    updateComment,
    deleteComment,
    getPostList,
  } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [updatedBody, setUpdatedBody] = useState("");
  const [newBody, setNewBody] = useState("");

  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      await getComments(postId);
    };

    fetchComments();
  }, [postId, getComments]);

  const handleEditClick = (id, body) => {
    setEditingCommentId(id);
    setUpdatedBody(body);
  };

  const handleUpdate = async () => {
    try {
      await updateComment(postId, editingCommentId, updatedBody);
      setEditingCommentId(null);
      setUpdatedBody("");
      await getPostList();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleNewComment = async () => {
    try {
      if (user) {
        await createComment(newBody, postId);
        setNewBody("");
      } else {
        alert("You are not logged in");
      }
    } catch (error) {
      console.error("Error creating Comment:", error);
    }
  };

  return (
    <div className="comment-section container">
      <h2 className="mb-4">Comments</h2>

      <div className="add-comment mb-5">
        <textarea
          className="form-control mb-3"
          placeholder="Write a comment..."
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
        ></textarea>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleNewComment}>
            Add Comment
          </button>
          <button className="btn btn-secondary" onClick={() => setNewBody("")}>
            Cancel
          </button>
        </div>
      </div>
      <div className="comments-list">
        {Array.isArray(comment) && comment.length > 0 ? (
          comment.map((comment) => (
            <div className="comment-card p-3 mb-4 shadow-sm" key={comment.id}>
              <p className="author-name fw-bold mb-1">{comment.author_name}</p>
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    className="form-control mb-3"
                    value={updatedBody}
                    onChange={(e) => setUpdatedBody(e.target.value)}
                  ></textarea>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={handleUpdate}>
                      Update
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingCommentId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="comment-body mb-2">{comment.body}</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEditClick(comment.id, comment.body)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteComment(postId, comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted">No comments found.</p>
        )}
      </div>
    </div>
  );
};

export default Comment;
