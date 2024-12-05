import { useCallback, useContext, useState } from "react";
import AppContext from "../../contextApi/AppContext";
import { Link } from "react-router-dom";
import { debounce } from "lodash"; 
import "./Search.css"; 

const Search = () => {
  const { categories, searchPosts, searchPost, postResults, searchResult } =
    useContext(AppContext);
  const [postSearchTerm, setPostSearchTerm] = useState("");
  const [isCategorySearch, setIsCategorySearch] = useState(false);

  const debouncedSearchPosts = useCallback(
    debounce((term) => {
      searchPosts(term);
    }, 300),
    []
  );

  const handlePostSearchChange = (e) => {
    e.preventDefault();

    const value = e.target.value;
    setPostSearchTerm(value);
    debouncedSearchPosts(value);
    setIsCategorySearch(false); 
  };

  const handleCategorySearch = (categoryName) => {
    searchPost(categoryName);
    setIsCategorySearch(true);
  };

  return (
    <div className="container py-5">
      <div className="categories-search mb-5">
        <h3 className="h4">Explore by Categories</h3>
        <div className="d-flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className="btn btn-outline-secondary category-btn"
              onClick={() => handleCategorySearch(category.name)} // Update search type on category click
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="posts-search">
        <h3 className="h4">Search Posts</h3>
        <input
          type="text"
          className="form-control search-input mb-4"
          value={postSearchTerm}
          onChange={handlePostSearchChange}
          placeholder="Search for posts..."
        />

        <div className="post-results">
          {isCategorySearch ? (
            <div className="card-columns">
              {searchResult.length > 0 ? (
                searchResult.map((post) => (
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
                      <h5 className="card-title text-black">{post.title}</h5>

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
                        <strong>{post.author_name}</strong>
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
                ))
              ) : (
                <p className="text-muted">No posts found in this category</p>
              )}
            </div>
          ) : (
            <div className="card-columns">
              {postResults.length > 0 ? (
                postResults.map((post) => (
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
                      <h5 className="card-title text-black">{post.title}</h5>

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
                        <strong>{post.author_name}</strong>
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
                ))
              ) : (
                <p className="text-muted">No posts found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
