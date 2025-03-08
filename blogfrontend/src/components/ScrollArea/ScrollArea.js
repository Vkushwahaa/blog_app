import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ScrollArea.css";




const ScrollArea = () => {
  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);


  const getPostList = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        nextPage ||
          `https://localhost-blog.onrender.com/api/post/?published=true&order_by=updated_at`
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

  // Fetch posts on component mount
  useEffect(() => {
    getPostList();
  }, [getPostList]);

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
          document.documentElement.scrollHeight &&
        hasMore &&
        !loading
      ) {
        getPostList();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [getPostList, hasMore, loading]);

  return (
    <div className="container mt-5">
      <div className="card-columns">
        {posts &&
          posts
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((post) => (
              <div className="card shadow-lg rounded" key={post.id}>
                {post.img ? (
                  <img
                    src={post.img}
                    alt={post.title || "Post Image"}
                    className="w-100 img-fluid rounded"
                    style={{ maxHeight: "350px", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ height: "10px" }}></div>
                )}
                <div className="card-body">
                  <h1 className="card-title text-black">{post.title}</h1>
                  <div
                    className="card-text"
                    dangerouslySetInnerHTML={{
                      __html:
                        post.body.length > 150
                          ? `${post.body.substring(0, 150)}...`
                          : post.body,
                    }}
                  />
                  <p className="card-text text-muted mb-2">
                    <strong>{post.author.user}</strong>
                  </p>
                  <p className="card-text text-muted mb-2">
                    <small>
                      {new Date(post.created_at).toLocaleDateString()}
                    </small>
                  </p>
                  <Link
                    to={`/${post.id}`}
                    className="btn btn-outline-black mt-auto"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default ScrollArea;
