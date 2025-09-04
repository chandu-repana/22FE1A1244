// src/pages/Home.js
import React, { useState } from "react";
import { nanoid } from "nanoid";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert
} from "@mui/material";
import { isValidUrl, isValidShortcode, parseValidityMinutes } from "../utils/validation";
import { mappingExists, saveUrlMapping } from "../utils/storage";
import { logEvent } from "../utils/logger";

function generateUniqueCode() {
  // Attempt a few times if collision occurs; nanoid reduces collisions but we check anyway.
  for (let i = 0; i < 8; i++) {
    const candidate = nanoid(6);
    if (!mappingExists(candidate)) return candidate;
  }
  // fallback longer id
  return nanoid(8);
}

export default function Home() {
  const emptyEntry = { longUrl: "", minutes: "", code: "" };
  const [entries, setEntries] = useState([ { ...emptyEntry } ]);
  const [alerts, setAlerts] = useState([]); // {severity, text}
  const [results, setResults] = useState([]);

  function addAlert(severity, text) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    setAlerts((s) => [...s, { id, severity, text }]);
    // auto-remove after 6s
    setTimeout(() => setAlerts((s) => s.filter(a => a.id !== id)), 6000);
  }

  const handleAddRow = () => {
    if (entries.length >= 5) {
      addAlert("warning", "You can shorten at most 5 URLs at a time.");
      return;
    }
    setEntries((e) => [...e, { ...emptyEntry }]);
  };

  const handleChange = (index, field, value) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleShorten = () => {
    const created = [];
    entries.forEach((entry, idx) => {
      const { longUrl, minutes, code } = entry;
      if (!isValidUrl(longUrl)) {
        addAlert("error", `Row ${idx + 1}: Invalid URL format.`);
        logEvent("error", "Invalid URL provided", { row: idx + 1, longUrl });
        return;
      }

      const parsedMinutes = parseValidityMinutes(minutes);
      if (parsedMinutes === null) {
        addAlert("error", `Row ${idx + 1}: Validity must be a positive integer.`);
        logEvent("error", "Invalid validity", { row: idx + 1, minutes });
        return;
      }

      let finalCode = code && code.trim() ? code.trim() : null;
      if (finalCode) {
        if (!isValidShortcode(finalCode)) {
          addAlert("error", `Row ${idx + 1}: Custom shortcode must be alphanumeric (3-15 chars).`);
          logEvent("error", "Invalid shortcode format", { row: idx + 1, code: finalCode });
          return;
        }
        if (mappingExists(finalCode)) {
          addAlert("error", `Row ${idx + 1}: Shortcode "${finalCode}" already exists.`);
          logEvent("error", "Shortcode collision", { row: idx + 1, code: finalCode });
          return;
        }
      } else {
        // generate unique
        finalCode = generateUniqueCode();
      }

      const expiry = Date.now() + parsedMinutes * 60_000;
      const record = {
        longUrl,
        createdAt: new Date().toISOString(),
        expiry,
        clicks: 0,
        clickHistory: []
      };

      saveUrlMapping(finalCode, record);
      logEvent("info", "Shortened URL created", { code: finalCode, longUrl, expiry });
      created.push({ code: finalCode, longUrl, expiry });
    });

    if (created.length > 0) {
      setResults(created);
      addAlert("success", `${created.length} short link(s) created.`);
      // reset entries back to single empty form
      setEntries([{ ...emptyEntry }]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>URL Shortener</Typography>

      {alerts.map(a => (
        <Alert key={a.id} severity={a.severity} sx={{ mb: 1 }}>{a.text}</Alert>
      ))}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Add up to 5 URLs (original URL, optional validity in minutes, optional shortcode)
          </Typography>

          <Grid container spacing={2}>
            {entries.map((row, i) => (
              <React.Fragment key={i}>
                <Grid item xs={12} md={7}>
                  <TextField
                    label={`Row ${i+1} — Long URL`}
                    placeholder="https://example.com/path"
                    value={row.longUrl}
                    onChange={(e) => handleChange(i, "longUrl", e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <TextField
                    label="Validity (min)"
                    placeholder="30"
                    value={row.minutes}
                    onChange={(e) => handleChange(i, "minutes", e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    label="Custom shortcode (optional)"
                    placeholder="myCode123"
                    value={row.code}
                    onChange={(e) => handleChange(i, "code", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>

          <Box mt={2}>
            <Button onClick={handleAddRow} variant="outlined" sx={{ mr: 2 }}>
              + Add Another
            </Button>
            <Button onClick={handleShorten} variant="contained">Shorten</Button>
          </Box>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="h6">Created Links</Typography>
        {results.length === 0 && <Typography color="text.secondary">No recent creations shown here.</Typography>}
        {results.map(r => (
          <Card key={r.code} variant="outlined" sx={{ my: 1 }}>
            <CardContent>
              <Typography><strong>Short:</strong> <a href={`/short/${r.code}`}>{window.location.origin}/short/{r.code}</a></Typography>
              <Typography><strong>Original:</strong> {r.longUrl}</Typography>
              <Typography><strong>Expires:</strong> {new Date(r.expiry).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
