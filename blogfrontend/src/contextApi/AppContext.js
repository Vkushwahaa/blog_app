import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
} from "react";
import AuthContext from "./AuthContext";

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
      const response = await fetch(
        `https://localhost-blog.onrender.com/api/authors/?id=${id}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAuthor(data);
      console.log("author", data);
    } catch (error) {
      console.error("Error fetching author:", error);
    }
  }, []);

  const [postResults, setPostResults] = useState([]);

  const searchPosts = useCallback(async (searchTerm) => {
    try {
      const response = await fetch(
        `https://localhost-blog.onrender.com/api/posts?title=${searchTerm}&published=True` // Added 'status=published'
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();

      setPostResults((prevResults) => {
        if (JSON.stringify(prevResults) === JSON.stringify(data)) {
          return prevResults;
        }
        return data;
      });
    } catch (error) {
      console.error("Error searching posts:", error);
      setPostResults([]);
    }
  }, []);

  const updateAuthorImage = async (newBio, newImage) => {
    const formData = new FormData();

    if (newBio) {
      formData.append("bio", newBio);
    }

    if (newImage) {
      formData.append("img", newImage);
    }

    try {
      const response = await fetch(`https://localhost-blog.onrender.com/api/author/edit/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authTokens?.access}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating author info:", errorData);
      } else {
        const updatedAuthor = await response.json();
        console.log("Author updated successfully:", updatedAuthor);
      }
    } catch (error) {
      console.error("Error updating author info:", error);
    }
  };

  const editBio = useCallback(async (bio) => {
    try {
      const response = await fetch(`https://localhost-blog.onrender.com/api/author/edit/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens.access}`,
        },
        body: JSON.stringify(bio),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAuthor(data);
    } catch (error) {
      console.error("Error editing bio:", error);
    }
  }, []);

  const [userPost, setUserPost] = useState([]);
  const [hasMorePost, setHasMorePost] = useState(true);
  const [nextPostPage, setNextPostPage] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const getUserPostList = useCallback(
    async (id) => {
      if (!hasMorePost || loadingPost) return;

      setLoadingPost(true);
      try {
        const response = await fetch(
          nextPostPage || `https://localhost-blog.onrender.com/api/userpost/?id=${id}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${authTokens?.access}` },
          }
        );
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
        console.error("Error fetching user posts:", error);
      }
      setLoadingPost(false);
    },
    [authTokens, hasMorePost, loadingPost, nextPostPage]
  );

  const loadMoreUserPost = useCallback(() => {
    if (!loadingPost && hasMorePost && nextPostPage) {
      getUserPostList(user?.id);
    }
  }, [loadingPost, hasMorePost, nextPostPage, getUserPostList, user?.id]);

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
      const response = await fetch(
        `https://localhost-blog.onrender.com/api/post/${id}?published=true`
      );
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
        const response = await fetch(`https://localhost-blog.onrender.com/api/post/${id}`, {
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
      const response = await fetch(`https://localhost-blog.onrender.com/api/category`);
      const data = await response.json();
      if (response.status === 200) {
        setCategories(data);

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
          `https://localhost-blog.onrender.com/api/search?category=${category}&${query}`,
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
        `https://localhost-blog.onrender.com/api/post/${postId}/comments/?published=true` // Filter comments based on post published status
      );
      const data = await response.json();
      setComment(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch(
        "https://localhost-blog.onrender.com/api/posts/?published=false",
        {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched drafts:", data);
        return data;
      } else {
        console.error("Failed to fetch drafts:", await response.json());
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  // ---------------------------------------------------POST-----------------------------------------------------------------------------------
  let [newComment, setNewComment] = useState("");

  const createPost = useCallback(
    async (newPost) => {
      console.log("Payload being sent:", newPost);

      try {
        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("body", newPost.body);
        formData.append("category", newPost.category);
        formData.append("published", newPost.published);
        formData.append("author", user?.username);

        if (newPost.img) {
          formData.append("img", newPost.img);
        }

        const response = await fetch(`https://localhost-blog.onrender.com/api/post/create/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from backend:", errorData);
        } else {
          console.log("Post created successfully!");
          navigate('/')
        }
      } catch (error) {
        console.error("Error creating post:", error);
      }
    },
    [authTokens, user,]
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

      const response = await fetch(
        `https://localhost-blog.onrender.com/api/post/${postId}/update/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
          body: formData,
        }
      );

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
        await fetch(`https://localhost-blog.onrender.com/api/post/${id}/delete/`, {
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
          `https://localhost-blog.onrender.com/api/post/${postId}/comment/create/`,
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
    [newComment, authTokens]
  );

  const updateComment = useCallback(
    async (postId, editingCommentId, updatedBody) => {
      try {
        const response = await fetch(
          `https://localhost-blog.onrender.com/api/post/${postId}/comment/${editingCommentId}/update/`,
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
    [authTokens?.access, getComments, getPost,]
  );

  const deleteComment = useCallback(
    async (postId, id) => {
      try {
        const response = await fetch(
          `https://localhost-blog.onrender.com/api/post/${postId}/comment/${id}/delete/`,
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
    [authTokens?.access, getPost,navigate]
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
    }),
    [
      postResults,
      searchPosts,
      getAuthor,
      author,
      editBio,
      post,
      userPost,
      comment,
      searchResult,
      searchPost,
      categories,
      uPost,
      fetchDrafts,
      nextPostPage,
    ]
  );
  return (
    <AppContext.Provider value={contextData}>{children}</AppContext.Provider>
  );
};
