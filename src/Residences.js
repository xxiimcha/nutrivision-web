import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  CircularProgress,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Get API URL from environment variable

function Residences({ loggedInUser }) {
  const [residenceAccounts, setResidenceAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); // Set loading state
        const response = await axios.get(`${API_BASE_URL}/users`); // Fetch data from the correct API URL
        const users = response.data.map((user) => ({
          ...user,
          status: user.status || 'active', // Default status to 'active' if not available
        }));
        setResidenceAccounts(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Stop loading state
      }
    };
    fetchUsers();
  }, []);

  const handleStatusChange = (user) => {
    setSelectedUser(user);
    setPassword(''); // Reset password input
    setPasswordDialogOpen(true); // Open password dialog
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setSelectedUser(null);
    setPasswordError(''); // Clear error
  };

  const handlePasswordSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login/verify-password`, {
        email: loggedInUser.email,  // Use the logged-in user's email
        password,
      });

      if (response.data.success) {
        const updatedStatus = selectedUser.status === 'active' ? 'inactive' : 'active';

        const updateResponse = await axios.put(`${API_BASE_URL}/users/${selectedUser._id}/status`, {
          status: updatedStatus,
        });

        const updatedAccounts = residenceAccounts.map((account) =>
          account._id === selectedUser._id
            ? { ...account, status: updatedStatus }
            : account
        );
        setResidenceAccounts(updatedAccounts); // Update the UI with the new status
        handlePasswordDialogClose();
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying password or updating status:', error);
      setPasswordError('Error verifying password or updating status.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update the search query state
  };

  // Filter residence accounts by name based on search query
  const filteredAccounts = residenceAccounts.filter((account) =>
    `${account.firstName} ${account.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Residence Accounts
        </Typography>
        
        {/* Search Field */}
        <TextField
          placeholder="Search by name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Display the Residence Accounts Table */}
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          {loading ? (
            <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell> 
                      <TableCell>{account.firstName}</TableCell>
                      <TableCell>{account.lastName}</TableCell>
                      <TableCell>{account.phone}</TableCell>
                      <TableCell>{account.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={account.status === 'active' ? 'secondary' : 'primary'}
                          onClick={() => handleStatusChange(account)}
                        >
                          {account.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No matching results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Password Confirmation Dialog */}
        <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose}>
          <DialogTitle>Password Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your password to confirm changing the user's status.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePasswordDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Residences;
