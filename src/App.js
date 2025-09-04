import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import Home from "./pages/Home";
import RedirectPage from "./pages/RedirectPage";
import Stats from "./pages/Stats";

export default function App() {
  return (
    <BrowserRouter>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="primary" sx={{ borderRadius: 0 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🚀 AffordMed URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/stats">Statistics</Button>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/short/:code" element={<RedirectPage />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
