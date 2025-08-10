import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ScrollArea.css";
import { API_URL } from "../../config";
import DOMPurify from "dompurify";

const ScrollArea = () => {
  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerTarget = useRef(null);

  const getPostList = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        nextPage || `${API_URL}/api/post/?published=true&order_by=updated_at`
      );

      if (response.ok) {
        const data = await response.json();

        setPosts((prevPosts) => {
          const newPosts = data.results.filter(
            (newPost) => !prevPosts.some((post) => post.id === newPost.id)
          );
          return [...prevPosts, ...newPosts];
        });

        setNextPage(data.next);
        setHasMore(Boolean(data.next));
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextPage]);

  // Fetch initial posts
  useEffect(() => {
    getPostList();
  }, [getPostList]);

  // IntersectionObserver for infinite scroll
  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          getPostList();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [getPostList, hasMore, loading]);

  // Safe HTML preview function
  const getPreviewHTML = (html, limit = 150) => {
    const cleanHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }); // strip tags
    const preview =
      cleanHTML.length > limit
        ? `${cleanHTML.substring(0, limit)}...`
        : cleanHTML;
    return preview;
  };

  return (
    <div className="container mt-5">
      <div className="row g-4">
        {[...posts]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((post) => (
            <div className="col-12 col-sm-6 col-lg-4" key={post.id}>
              <div className="card shadow-lg rounded h-100">
                {post.img ? (
                  <img
                    src={post.img}
                    alt={post.title || "Post Image"}
                    className="w-100 img-fluid rounded-top"
                    style={{
                      maxHeight: "250px",
                      width: "100%",
                      objectFit:
                        post.imgWidth > post.imgHeight ? "contain" : "cover",
                    }}
                  />
                ) : (
                  <div style={{ height: "10px" }}></div>
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-black">{post.title}</h5>
                  <p className="card-text">{getPreviewHTML(post.body)}</p>
                  <p className="card-text text-muted mb-1">
                    <strong>{post.author.user}</strong>
                  </p>
                  <p className="card-text text-muted mb-3">
                    <small>
                      {new Date(post.created_at).toLocaleDateString()}
                    </small>
                  </p>
                  <Link
                    to={`/${post.id}`}
                    className="btn btn-outline-dark mt-auto align-self-start"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* IntersectionObserver trigger */}
      {hasMore && (
        <div ref={observerTarget} className="text-center my-4">
          {loading && <div>Loading more...</div>}
        </div>
      )}
    </div>
  );
};

export default ScrollArea;
