import React, { useState, useEffect, useContext } from 'react';
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
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { UserContext } from './context/UserContext'; // Import UserContext

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Residences() {
  const { email } = useContext(UserContext); // Access user email from UserContext
  const [residenceAccounts, setResidenceAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        const response = await axios.get(`${API_BASE_URL}/users`);
        const users = response.data.map((user) => ({
          ...user,
          status: user.status || 'active',
        }));
        setResidenceAccounts(users);
        console.log('Users fetched:', users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Open password confirmation dialog
  const handleStatusChange = (user) => {
    console.log('Selected user for status change:', user);
    setSelectedUser(user);
    setPassword('');
    setPasswordDialogOpen(true);
  };

  // Close password confirmation dialog
  const handlePasswordDialogClose = () => {
    console.log('Closing password confirmation dialog');
    setPasswordDialogOpen(false);
    setSelectedUser(null);
    setPasswordError('');
  };

  // Verify password and update status
  const handlePasswordSubmit = async () => {
    if (!email) {
      console.log('Logged-in user email missing');
      setPasswordError('Logged-in user information is missing.');
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying password for email:', email);
      const response = await axios.post(`${API_BASE_URL}/login/verify-password-and-update-status`, {
        email, // Use the email from UserContext (logged-in user)
        password, // The password entered by the user
        userId: selectedUser._id, // The selected user to update status
        newStatus: selectedUser.status === 'active' ? 'inactive' : 'active' // Toggle status
      });

      console.log('Response from password verification:', response.data);

      if (response.data.success) {
        // Update the residence accounts list with the new status
        const updatedAccounts = residenceAccounts.map((account) =>
          account._id === selectedUser._id
            ? { ...account, status: response.data.updatedStatus }
            : account
        );
        setResidenceAccounts(updatedAccounts);
        console.log('Updated accounts:', updatedAccounts);
        handlePasswordDialogClose(); // Close the dialog after successful operation
      } else {
        console.log('Password incorrect. Please try again.');
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
    setSearchQuery(e.target.value);
    console.log('Search query changed:', e.target.value);
  };

  const filteredAccounts = residenceAccounts.filter((account) =>
    `${account.firstName} ${account.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Residence Accounts
        </Typography>

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
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{account.firstName || 'Unknown'}</TableCell>
                      <TableCell>{account.lastName || 'Unknown'}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={account.status === 'active' ? 'Active' : 'Inactive'}
                          color={account.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
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
