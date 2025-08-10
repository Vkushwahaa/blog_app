import { useEffect, useState, useContext } from "react";
import AppContext from "../../contextApi/AppContext";
import AuthContext from "../../contextApi/AuthContext";
import "./Bio.css";

const MAX_BIO_LENGTH = 225;
const COLLAPSE_LENGTH = 100;

const Bio = ({ id }) => {
  const { user } = useContext(AuthContext);
  const { author, getAuthor, editBio, updateAuthorImage } =
    useContext(AppContext);

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      await getAuthor(id);
    };
    fetchAuthor();
  }, [id, getAuthor]);

  // Update local bio state when author.bio changes
  useEffect(() => {
    if (author?.bio) setBio(author.bio);
  }, [author?.bio]);

  const handleCreateOrUpdate = async () => {
    if (image) {
      await updateAuthorImage(bio, image);
    } else {
      await editBio({ bio });
    }
    setEditing(false);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle bio change with max length restriction
  const handleBioChange = (e) => {
    if (e.target.value.length <= MAX_BIO_LENGTH) {
      setBio(e.target.value);
    }
  };

  // Utility to display bio (collapsed or full)
  const renderBioText = () => {
    if (!author?.bio)
      return <span className="text-warning">No bio provided</span>;

    if (author.bio.length <= COLLAPSE_LENGTH) {
      return author.bio;
    }

    if (showFullBio) {
      return (
        <>
          {author.bio}{" "}
          <button
            type="button"
            className="btn p-1"
            onClick={() => setShowFullBio(false)}
          >
            See Less
          </button>
        </>
      );
    }

    return (
      <>
        {author.bio.slice(0, COLLAPSE_LENGTH)}...{" "}
        <button
          type="button"
          className="btn p-1"
          onClick={() => setShowFullBio(true)}
        >
          See More
        </button>
      </>
    );
  };

  return (
    <div className="bioCard card shadow-sm border-0 mb-4">
      <div className="card-body">
        {author ? (
          <>
            <div className="d-flex align-items-center">
              <div className="me-3 profile-image-wrapper">
                <img
                  src={author.img}
                  alt="Author Avatar"
                  className="rounded-circle bio-image"
                  width="150"
                  height="150"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="bio-shape">
                <h1 className="mb-3 bio-user">{author.user}</h1>
                <p className="text-muted mb-0 bio-bio">
                  <strong>Bio:</strong>{" "}
                  {editing ? (
                    <textarea
                      className="form-control"
                      value={bio}
                      onChange={handleBioChange}
                      placeholder="Enter your bio"
                      rows="3"
                      maxLength={MAX_BIO_LENGTH}
                    />
                  ) : (
                    renderBioText()
                  )}
                </p>
              </div>
            </div>

            {parseInt(id) === parseInt(user?.user_id) && (
              <div className="mt-4">
                {editing ? (
                  <div>
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small>
                        {bio.length} / {MAX_BIO_LENGTH} characters
                      </small>
                      <div>
                        <button
                          className="btn btn-success me-2"
                          onClick={handleCreateOrUpdate}
                          disabled={bio.trim().length === 0}
                        >
                          {author.bio
                            ? "Update Bio & Image"
                            : "Add Bio & Image"}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setBio(author.bio || "");
                            setEditing(false);
                            setImage(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
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
              Post your first blog to use profile page
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bio;
