import React, { useEffect, useState, useContext } from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import axios from 'axios';
import { UserContext } from './context/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const fetchActivityLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activity-logs`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
};

function ActivityLog() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the role from the UserContext
  const { role } = useContext(UserContext);

  useEffect(() => {
    const getLogs = async () => {
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      setLoading(false);
    };

    getLogs();
  }, []);

  // If the logged-in user is not Admin or Super Admin, return an "Access Denied" message
  if (role !== 'Admin' && role !== 'Super Admin') {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" color="error">
          Access Denied. You do not have permission to view the Activity Log.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Activity Log
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activityLogs.length > 0 ? (
                activityLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No activity logs available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ActivityLog;
