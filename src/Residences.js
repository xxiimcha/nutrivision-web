import React, { useState } from 'react';
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
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const initialResidenceAccounts = [
  { id: 1, name: 'John Doe', houseNumber: '123', street: 'Main St', phone: '09123456789' },
  { id: 2, name: 'Jane Smith', houseNumber: '456', street: 'Oak Ave', phone: '09556789012' },
  { id: 3, name: 'Michael Johnson', houseNumber: '789', street: 'Pine Rd', phone: '09876543210' },
  // Add more residence accounts as needed
];

const addressOptions = [
  { zone: 'Zone 1', streets: ['Kalayaano', 'Santol', 'Half Acacia', 'Half Narra'] },
  { zone: 'Zone 2', streets: ['Half Acacia', 'Molave'] },
  { zone: 'Zone 3', streets: ['Ilang-ilang', 'Jasmin', 'Camia', 'Guiho', 'Lower Guiho', 'Half Sampaguita', 'Half Acacia'] },
  { zone: 'Zone 4', streets: ['Manga', 'Chico', 'Kamias', 'Bayabas', 'Half Banaba', 'Half Sampaguita'] },
  { zone: 'Zone 5', streets: ['Half manga', 'Half Tangile', 'Half Ipil', 'Half Acacia', 'Half Banaba'] },
  { zone: 'Zone 6', streets: ['Half Narra', 'Half Tangile', 'Mabolo'] },
  { zone: 'Zone 7', streets: ['Bliss'] },
  { zone: 'Zone 8', streets: ['Macda'] }
];

function Residences() {
  const [residenceAccounts, setResidenceAccounts] = useState(initialResidenceAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newUser, setNewUser] = useState({ id: '', name: '', houseNumber: '', street: '', phone: '09' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [duplicateError, setDuplicateError] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setNewUser({ id: '', name: '', houseNumber: '', street: '', phone: '09' });
    setDuplicateError('');
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
      address: name === 'houseNumber' || name === 'street' ? `${newUser.houseNumber} ${newUser.street}` : prevUser.address,
    }));
  };

  const validatePhoneNumber = (phone) => {
    return /^09\d{9}$/.test(phone);
  };

  const handleAddUser = () => {
    if (!validatePhoneNumber(newUser.phone)) {
      setDuplicateError('Phone number must be exactly 11 digits and start with "09".');
      return;
    }
    if (residenceAccounts.some(account => account.name.toLowerCase() === newUser.name.toLowerCase())) {
      setDuplicateError('Name already exists.');
      return;
    }
    setResidenceAccounts((prevAccounts) => [
      ...prevAccounts,
      { ...newUser, id: prevAccounts.length + 1 }
    ]);
    handleClose();
  };

  const handleEditUser = () => {
    if (residenceAccounts.some(account => account.name.toLowerCase() === newUser.name.toLowerCase() && account.id !== currentUserId)) {
      setDuplicateError('Name already exists.');
      return;
    }
    if (residenceAccounts.some(account => account.phone === newUser.phone && account.id !== currentUserId)) {
      setDuplicateError('Phone number already exists.');
      return;
    }
    setResidenceAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === currentUserId ? { ...account, ...newUser } : account
      )
    );
    handleClose();
  };

  const handleDeleteUser = () => {
    setResidenceAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account.id !== userToDelete.id)
    );
    handleDeleteDialogClose();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditClick = (account) => {
    setCurrentUserId(account.id);
    setNewUser({ name: account.name, houseNumber: account.houseNumber, street: account.street, phone: account.phone });
    setEditMode(true);
    setOpen(true);
  };

  const handleDeleteClick = (account) => {
    setUserToDelete(account);
    setDeleteDialogOpen(true);
  };

  const filteredAccounts = residenceAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Residence Content
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
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          Add User
        </Button>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.id}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{`${account.houseNumber} ${account.street}`}</TableCell>
                    <TableCell>{account.phone}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(account)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(account)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No matching results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {editMode ? 'Edit the details of the residence account.' : 'To add a new residence account, please fill out the form below.'}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={newUser.name}
              onChange={handleChange}
              error={!!duplicateError}
              helperText={duplicateError}
            />
            <TextField
              margin="dense"
              name="houseNumber"
              label="House Number"
              type="text"
              fullWidth
              value={newUser.houseNumber}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Street</InputLabel>
              <Select
                name="street"
                value={newUser.street}
                onChange={handleChange}
              >
                {addressOptions.map((zone, index) => (
                  <optgroup key={index} label={zone.zone}>
                    {zone.streets.map((street, idx) => (
                      <MenuItem key={idx} value={street}>
                        {street}
                      </MenuItem>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="phone"
              label="Phone"
              type="text"
              fullWidth
              value={newUser.phone}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={editMode ? handleEditUser : handleAddUser} color="primary">
              {editMode ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
        >
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteUser} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Residences;
