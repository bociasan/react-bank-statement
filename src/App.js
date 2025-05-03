import React, { useState } from "react";
import {
  Container,
  CssBaseline,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  createTheme,
  ThemeProvider,
  Button,
  Box,
  TextField,
} from "@mui/material";
import Papa from "papaparse";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ columnIndex: null, direction: "asc" });
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const data = result.data;

        const trimmed = data.slice(14).filter((row) => row.length > 1);
        if (trimmed.length === 0) {
          alert("No data found after skipping 14 rows.");
          return;
        }

        const headerRow = trimmed[0];
        const dataRows = trimmed.slice(1);

        setHeaders(headerRow);
        setRows(dataRows);

        const debitTotal = dataRows.reduce((sum, row) => {
          const val = parseFloat((row[4] || "").replace(/,/g, ""));
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const creditTotal = dataRows.reduce((sum, row) => {
          const val = parseFloat((row[5] || "").replace(/,/g, ""));
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        setTotals({ debit: debitTotal, credit: creditTotal });
      },
      error: (err) => {
        alert("Error parsing CSV: " + err.message);
      },
    });
  };

  const handleSort = (index) => {
    let direction = "asc";
    if (sortConfig.columnIndex === index && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...rows].sort((a, b) => {
      const aVal = a[index] || "";
      const bVal = b[index] || "";

      const aParsed = parseFloat((aVal || "").replace(/,/g, ""));
      const bParsed = parseFloat((bVal || "").replace(/,/g, ""));

      if (!isNaN(aParsed) && !isNaN(bParsed)) {
        return direction === "asc" ? aParsed - bParsed : bParsed - aParsed;
      }

      return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
    });

    setSortConfig({ columnIndex: index, direction });
    setRows(sorted);
  };

  return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bank Statement CSV Viewer
          </Typography>

          <Button variant="contained" component="label" sx={{ mb: 3 }}>
            Upload CSV File
            <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
          </Button>

          {headers.length > 0 && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    💳 Total Debit: {totals.debit.toFixed(2)}
                  </Typography>
                  <Typography variant="h6">
                    💰 Total Credit: {totals.credit.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <TextField
                      label="Search Description"
                      variant="outlined"
                      fullWidth
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setSearchQuery("");
                      }}
                  >
                    Clear
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map((header, idx) => (
                            <TableCell
                                key={idx}
                                onClick={() => handleSort(idx)}
                                sx={{ cursor: "pointer" }}
                            >
                              {header}{" "}
                              {sortConfig.columnIndex === idx &&
                                  (sortConfig.direction === "asc" ? "▲" : "▼")}
                            </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows
                          .filter((row) =>
                              (row[2] || "")
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                          )
                          .map((row, idx) => (
                              <TableRow key={idx}>
                                {row.map((cell, i) => (
                                    <TableCell key={i}>{cell}</TableCell>
                                ))}
                              </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
          )}
        </Container>
      </ThemeProvider>
  );
}

export default App;
