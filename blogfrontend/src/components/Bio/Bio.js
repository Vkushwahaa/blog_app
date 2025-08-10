import { useEffect, useState, useContext } from "react";
import AppContext from "../../contextApi/AppContext";
import AuthContext from "../../contextApi/AuthContext";
import "./Bio.css";
const Bio = ({ id, len }) => {
  const { user } = useContext(AuthContext); // User info from authentication context
  const { author, getAuthor, editBio, updateAuthorImage } =
    useContext(AppContext); // Get author and bio management functions
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      await getAuthor(id);
    };
    fetchAuthor();
  }, [id, getAuthor]);

  const handleCreate = async () => {
    await editBio({ bio });
    setEditing(false);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleImageUpdate = async () => {
    if (image) {
      await updateAuthorImage(bio, image);
    } else {
      await editBio({ bio });
    }
    setEditing(false);
  };

  return (
    <div className="bioCard card shadow-sm border-0 mb-4">
      <div className="card-body">
        {author ? (
          <>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <img
                  src={author.img}
                  alt="Author Avatar"
                  className="rounded-circle bio-image"
                  width="150"
                  height="150"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div>
                <h1 className="mb-3 bio-user">{author.user}</h1>
                <p className="text-muted mb-0 bio-bio">
                  <strong>Bio:</strong>{" "}
                  {author.bio || (
                    <span className="text-warning">No bio provided</span>
                  )}
                </p>
              </div>
            </div>

            {parseInt(id) === parseInt(user?.user_id) && (
              <div className="mt-4">
                {editing ? (
                  <div>
                    <textarea
                      className="form-control mb-2"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Enter your bio"
                      rows="3"
                    />
                    <div className="form-group mb-3">
                      <label htmlFor="image" className="form-label">
                        Upload Profile Image
                      </label>
                      <input
                        type="file"
                        id="image"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-success me-2"
                        onClick={author.bio ? handleImageUpdate : handleCreate}
                      >
                        {author.bio
                          ? "Update Bio & Image"
                          : "Update Bio & Image"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => setEditing(true)}
                  >
                    {author.bio ? "Edit Bio & Image" : "Add Bio & Image"}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-muted mb-0">
              post your first blog to use profile page
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bio;
