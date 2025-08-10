import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
} from "react";
import AuthContext from "./AuthContext";
import { API_URL } from "../config";

import { useNavigate } from "react-router-dom";
export const AppContext = createContext();
export default AppContext;

export const AppProvider = ({ children }) => {
  let { authTokens, user } = useContext(AuthContext);
  let navigate = useNavigate();

  const [post, setPost] = useState("");

  const [categories, setCategories] = useState([]);
  const [searchResult, setSearchResult] = useState([]);

  const [comment, setComment] = useState([]);

  const [author, setAuthor] = useState(null);

  const getAuthor = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/authors/?id=${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAuthor(data);
      console.log("author data from appcontext 38 line", data);
    } catch (error) {
      console.error("Error fetching author:", error);
    }
  }, []);

  const [postResults, setPostResults] = useState([]);

  const searchPosts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      // Clear results or do nothing if search term is empty
      setPostResults([]);
      return { success: false, message: "No search term provided." };
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/?title=${encodeURIComponent(
          searchTerm
        )}&published=True`
      );

      const data = await response.json();

      if (!response.ok) {
        console.warn("Backend returned error:", data);
        setPostResults([]);
        return {
          success: false,
          message: data.detail || "Something went wrong.",
        };
      }

      setPostResults((prevResults) => {
        if (JSON.stringify(prevResults) === JSON.stringify(data)) {
          return prevResults;
        }
        return data;
      });

      return { success: true };
    } catch (error) {
      console.error("Network or parsing error:", error);
      setPostResults([]);
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const updateAuthorImage = useCallback(
    async (newBio, newImage) => {
      const formData = new FormData();
      if (newBio) formData.append("bio", newBio);
      if (newImage) formData.append("img", newImage);

      try {
        const response = await fetch(`${API_URL}/api/author/edit/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error updating author info:", errorData);
        } else {
          await getAuthor(user.user_id);
          // Optionally: console.log("Author updated successfully");
        }
      } catch (error) {
        console.error("Error updating author info:", error);
      }
    },
    [authTokens?.access, getAuthor, user?.user_id]
  );

  const editBio = useCallback(
    async (bio) => {
      if (!authTokens?.access) {
        console.error("No auth token found. User might not be logged in.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/author/edit/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokens.access}`,
          },
          body: JSON.stringify(bio),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        // ✅ Refresh author after update
        await getAuthor(user.user_id);
      } catch (error) {
        console.error("Error editing bio:", error);
      }
    },
    [authTokens, user, getAuthor]
  );

  const [userPost, setUserPost] = useState([]);
  const [hasMorePost, setHasMorePost] = useState(true);
  const [nextPostPage, setNextPostPage] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const getPublicUserPosts = useCallback(
    async (id) => {
      if (!hasMorePost || loadingPost) return;

      setLoadingPost(true);
      try {
        const url = nextPostPage || `${API_URL}/api/posts/?author_id=${id}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 200) {
          setUserPost((prevPosts) => [
            ...prevPosts,
            ...data.results.filter(
              (newPost) => !prevPosts.some((post) => post.id === newPost.id)
            ),
          ]);
          setNextPostPage(data.next);
          setHasMorePost(!!data.next);
        }
      } catch (error) {
        console.error("Error fetching public posts:", error);
      }
      setLoadingPost(false);
    },
    [hasMorePost, loadingPost, nextPostPage]
  );

  const getUserPostList = useCallback(
    async (id, isAuthor) => {
      if (!hasMorePost || loadingPost) return;

      setLoadingPost(true);

      try {
        let url;
        let options = {};

        if (isAuthor && authTokens?.access) {
          // Authenticated author - call /userpost endpoint with auth headers
          url = nextPostPage || `${API_URL}/api/userpost/?id=${id}`;
          options = {
            method: "GET",
            headers: { Authorization: `Bearer ${authTokens.access}` },
          };
        } else {
          // Public view - call /post endpoint without auth headers
          url = nextPostPage || `${API_URL}/api/post/?author_id=${id}`;
          options = { method: "GET" };
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (response.status === 200) {
          setUserPost((prevPosts) => [
            ...prevPosts,
            ...data.results.filter(
              (newPost) => !prevPosts.some((post) => post.id === newPost.id)
            ),
          ]);
          setNextPostPage(data.next);
          setHasMorePost(!!data.next);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }

      setLoadingPost(false);
    },
    [authTokens, hasMorePost, loadingPost, nextPostPage]
  );

  const loadMoreUserPost = useCallback(() => {
    if (!loadingPost && hasMorePost && nextPostPage) {
      getUserPostList(user?.user_id);
    }
  }, [loadingPost, hasMorePost, nextPostPage, getUserPostList, user?.user_id]);

  useEffect(() => {
    setUserPost([]);
  }, [user]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
          document.documentElement.scrollHeight &&
        hasMorePost &&
        !loadingPost
      ) {
        loadMoreUserPost();
      }
    };

    const debounceScroll = debounce(handleScroll, 200);
    window.addEventListener("scroll", debounceScroll);

    return () => window.removeEventListener("scroll", debounceScroll);
  }, [loadMoreUserPost, hasMorePost, loadingPost]);

  const getPost = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/post/${id}?published=true`);
      const data = await response.json();
      if (response.status === 200) {
        setPost(data.post);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  }, []);

  const [uPost, setUPost] = useState(null);

  const getPostUpdate = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/api/post/${id}`, {
          headers: {
            Authorization: `Bearer ${authTokens?.access}`, // If using JWT authentication
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          setUPost(data.post);
        } else if (response.status === 403) {
          console.error(
            "Access denied: You do not have permission to view this post."
          );
        } else {
          console.error("Error fetching post:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    },
    [authTokens]
  );

  //fetch categories
  const getCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        setCategories(data);
        console.log("API Response:", data);

        console.log("category daata", data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // search a post

  const searchPost = useCallback(
    async (category) => {
      try {
        const query = user?.isAuthenticated
          ? "?published=True"
          : "?published=True"; // Add this filter to exclude unpublished posts
        const response = await fetch(
          `${API_URL}/api/search?category=${category}&${query}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        if (response.status === 200) {
          setSearchResult(data);
        }
      } catch (error) {
        console.error("Error searching posts:", error);
      }
    },
    [user?.isAuthenticated]
  );

  // comments
  const getComments = useCallback(async (postId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/post/${postId}/comments/?published=true` // Filter comments based on post published status
      );
      const data = await response.json();
      setComment(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/?published=false`, {
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Optionally: console.log("Fetched drafts:", data);
        return data;
      } else {
        console.error("Failed to fetch drafts:", await response.json());
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  }, [authTokens?.access]);

  // ---------------------------------------------------POST-----------------------------------------------------------------------------------
  // let [newComment, setNewComment] = useState("");

  const createPost = useCallback(
    async (postData) => {
      let bodyToSend;
      let headers = {
        Authorization: `Bearer ${authTokens?.access}`,
      };

      if (postData.img) {
        bodyToSend = new FormData();
        bodyToSend.append("title", postData.title);
        bodyToSend.append("body", postData.body);
        bodyToSend.append("category", postData.category);
        bodyToSend.append("published", postData.published);
        bodyToSend.append("img", postData.img);
      } else {
        bodyToSend = JSON.stringify(postData);
        headers["Content-Type"] = "application/json";
      }

      try {
        const response = await fetch(`${API_URL}/api/post/create/`, {
          method: "POST",
          headers,
          body: bodyToSend,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        // Optionally: console.log("Post created successfully:", data);
        return data;
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    },
    [authTokens?.access]
  );

  const updatePost = useCallback(
    async (updatedPost, postId) => {
      try {
        const formData = new FormData();
        formData.append("title", updatedPost.title);
        formData.append("body", updatedPost.body);
        formData.append("category", updatedPost.category);
        formData.append("published", updatedPost.published);
        if (updatedPost.img instanceof File) {
          formData.append("img", updatedPost.img);
        }

        const response = await fetch(`${API_URL}/api/post/${postId}/update/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error updating post:", errorData);
        } else {
          console.log("Post updated successfully!");
          navigate("/"); // Navigate after refreshing the list
        }
      } catch (error) {
        console.error("Error updating post:", error);
      }
    },
    [authTokens, navigate]
  );

  const deletePost = useCallback(
    async (id) => {
      try {
        await fetch(`${API_URL}/api/post/${id}/delete/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokens?.access}`,
          },
        });
        navigate("/");
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    },
    [authTokens, navigate]
  );

  // comments
  const createComment = useCallback(
    async (newBody, postId) => {
      try {
        const response = await fetch(
          `${API_URL}/api/post/${postId}/comment/create/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authTokens?.access}`,
            },
            body: JSON.stringify({ body: newBody }),
          }
        );
        await response.json();
        await getComments(postId);
      } catch (error) {
        console.error("Error creating comment:", error);
      }
    },
    [authTokens, getComments]
  );

  const updateComment = useCallback(
    async (postId, editingCommentId, updatedBody) => {
      try {
        const response = await fetch(
          `${API_URL}/api/post/${postId}/comment/${editingCommentId}/update/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens?.access),
            },
            body: JSON.stringify({ body: updatedBody }),
          }
        );
        if (response.ok) {
          await getComments(postId);
          await getPost(postId);
        } else {
          console.error("Error updating comment");
        }
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    },
    [authTokens?.access, getComments, getPost]
  );

  const deleteComment = useCallback(
    async (postId, id) => {
      try {
        const response = await fetch(
          `${API_URL}/api/post/${postId}/comment/${id}/delete/`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens?.access),
            },
          }
        );
        if (response.ok) {
          await getPost(postId);
          await getComments(postId);
        } else {
          console.error("Error deleting comment");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    },
    [authTokens?.access, getPost, getComments]
  );
  const contextData = useMemo(
    () => ({
      postResults,
      searchPosts,
      getAuthor,
      author,
      editBio,
      post,
      updatePost,
      getUserPostList,
      setUserPost,
      setHasMorePost,
      nextPostPage,
      setNextPostPage,
      userPost,
      getPost,
      comment,
      getComments,
      searchResult,
      searchPost,
      categories,
      createPost,
      deletePost,
      fetchDrafts,
      createComment,
      updateComment,
      deleteComment,
      uPost,
      getPostUpdate,
      updateAuthorImage,
      getPublicUserPosts,
    }),
    [
      postResults,
      searchPosts,
      getAuthor,
      author,
      editBio,
      post,
      updatePost,
      getUserPostList,
      setUserPost,
      setHasMorePost,
      nextPostPage,
      setNextPostPage,
      userPost,
      getPost,
      comment,
      getComments,
      searchResult,
      searchPost,
      categories,
      createPost,
      deletePost,
      fetchDrafts,
      createComment,
      updateComment,
      deleteComment,
      uPost,
      getPostUpdate,
      updateAuthorImage,
      getPublicUserPosts,
    ]
  );
  return (
    <AppContext.Provider value={contextData}>{children}</AppContext.Provider>
  );
};
