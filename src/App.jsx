// frontend/src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Projects from "./pages/Projects";
import ProjectsList from "./components/pages/projects/ProjectsList";
import Analytics from "./components/pages/projects/Analytics";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-bg-50">
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/projects" element={<Projects />}>
              <Route index element={<ProjectsList />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
