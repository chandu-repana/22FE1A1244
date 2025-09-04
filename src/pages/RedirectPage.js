// src/pages/RedirectPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUrlMapping, incrementClick } from "../utils/storage";
import { logEvent } from "../utils/logger";
import { Box, Typography, Alert, Button } from "@mui/material";

export default function RedirectPage() {
  const { code } = useParams();
  const [status, setStatus] = useState({ state: "checking", message: "" });

  useEffect(() => {
    const rec = getUrlMapping(code);
    if (!rec) {
      setStatus({ state: "invalid", message: "Short link not found." });
      logEvent("error", "Redirect failed - not found", { code });
      return;
    }

    if (Date.now() > rec.expiry) {
      setStatus({ state: "expired", message: "This link has expired." });
      logEvent("info", "Redirect attempted for expired link", { code });
      return;
    }

    // Update click stats
    incrementClick(code);
    logEvent("info", "Redirecting to long URL", { code, longUrl: rec.longUrl });
    // perform redirect
    window.location.href = rec.longUrl;
  }, [code]);

  return (
    <Box p={3}>
      {status.state === "checking" && <Typography>Redirecting...</Typography>}
      {status.state === "invalid" && <Alert severity="error">{status.message}</Alert>}
      {status.state === "expired" && <Alert severity="warning">{status.message}</Alert>}
      <Box mt={2}>
        <Button variant="outlined" href="/">Go back to app</Button>
      </Box>
    </Box>
  );
}
