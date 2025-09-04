// src/pages/Stats.js
import React, { useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Collapse, List, ListItem, Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getAllMappings } from "../utils/storage";
import { logEvent } from "../utils/logger";

export default function Stats() {
  const [mappings, setMappings] = useState(getAllMappings());
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (code) => {
    setOpenRows((s) => ({ ...s, [code]: !s[code] }));
  };

  const refresh = () => {
    const data = getAllMappings();
    setMappings(data);
    logEvent("info", "Stats refreshed");
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>URL Statistics</Typography>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={refresh}>Refresh</Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Short Code</TableCell>
              <TableCell>Short URL</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Expiry (date/time)</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(mappings).length === 0 && (
              <TableRow><TableCell colSpan={6}>No entries yet.</TableCell></TableRow>
            )}

            {Object.entries(mappings).map(([code, rec]) => (
              <React.Fragment key={code}>
                <TableRow>
                  <TableCell>{code}</TableCell>
                  <TableCell>
                    <a href={`/short/${code}`}>{window.location.origin}/short/{code}</a>
                  </TableCell>
                  <TableCell style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <a href={rec.longUrl} target="_blank" rel="noreferrer">{rec.longUrl}</a>
                  </TableCell>
                  <TableCell>{new Date(rec.expiry).toLocaleString()}</TableCell>
                  <TableCell>{rec.clicks || 0}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleRow(code)} aria-label="expand">
                      <ExpandMoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={!!openRows[code]} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="subtitle2">Click History</Typography>
                        {(!rec.clickHistory || rec.clickHistory.length === 0) ? (
                          <Typography color="text.secondary">No clicks recorded</Typography>
                        ) : (
                          <List dense>
                            {rec.clickHistory.slice().reverse().map((ts, i) => (
                              <ListItem key={i}>{new Date(ts).toLocaleString()}</ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
