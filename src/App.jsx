import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
} from "@mui/material";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import CharacterBackground from "./components/CharacterBackground";
import HomeIcon from "@mui/icons-material/Home";

import LandingPage from "./pages/LandingPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Photography from "./pages/Photography";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary"; // Import ErrorBoundary
import theme from "./theme";

function App() {
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CharacterBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <AppBar position="fixed" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton component={Link} to="/" color="inherit" sx={{ mr: 2 }}>
              <HomeIcon />
            </IconButton>

            <Button color="inherit" component={Link} to="/blog">
              Blog
            </Button>
            <Button color="inherit" component={Link} to="/photography">
              Photography
            </Button>
            <Button color="inherit" component={Link} to="/about">
              About
            </Button>
            <Button color="inherit" component={Link} to="/admin/login">
              Admin
            </Button>
          </Toolbar>
        </AppBar>
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            pt: "64px",
          }}
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route
              path="/blog/:id"
              element={
                <ErrorBoundary>
                  <BlogPost />
                </ErrorBoundary>
              }
            />{" "}
            {/* Wrap BlogPost with ErrorBoundary */}
            <Route path="/photography" element={<Photography />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
