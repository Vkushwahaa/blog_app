import "./App.css";
import ScrollArea from "./components/ScrollArea/ScrollArea";
import { AppProvider } from "./contextApi/AppContext";
import { Route, Routes } from "react-router-dom";
import SinglePostPage from "./components/SinglePostPage/SinglePostPage";
import Search from "./components/Search/Search";
import Header from "./components/Header/Header";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { AuthProvider } from "./contextApi/AuthContext";

import CreateBlogPage from "./pages/CreateblogPage/createBlogPage";
import UserPage from "./pages/userPage/UserPage";
import DashBoard from "./pages/dashboard/Dashboard";
import UpdateBlogPage from "./pages/updateBlog/UpdateBlog";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppProvider>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/:id" element={<SinglePostPage />} />
            <Route path="/" element={<ScrollArea />} />
            <Route path="/createBlog" element={<CreateBlogPage />} />
            <Route path="/updateBlog/:id" element={<UpdateBlogPage />} />

            <Route path="/userPage/:id" element={<UserPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<DashBoard />} />
          </Routes>
          <Footer />
        </AppProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
