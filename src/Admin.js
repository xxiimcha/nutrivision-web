import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function Admin() {
  const [adminDetails, setAdminDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // To track if we are in edit mode
  const [selectedAdminId, setSelectedAdminId] = useState(null); // To track the selected admin's ID
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admins');
        const adminsWithId = response.data.map((admin) => ({
          ...admin,
          id: admin._id,
        }));
        setAdmins(adminsWithId);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, role } = adminDetails;

    if (editMode) {
      // Update existing admin
      try {
        const response = await axios.put(`http://localhost:5000/api/admins/${selectedAdminId}`, {
          firstName,
          lastName,
          email,
          role,
        });

        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.id === selectedAdminId ? { ...response.data, id: selectedAdminId } : admin
          )
        );

        setEditMode(false);
        setSelectedAdminId(null);
      } catch (error) {
        console.error("Error updating admin:", error);
      }
    } else {
      // Create new admin
      try {
        const response = await axios.post('http://localhost:5000/api/admins', {
          firstName,
          lastName,
          email,
          role,
        });

        setAdmins((prevAdmins) => [
          ...prevAdmins,
          { ...response.data, id: response.data._id, password: response.data.password },
        ]);
      } catch (error) {
        console.error("Error adding admin:", error);
      }
    }

    setAdminDetails({
      firstName: '',
      lastName: '',
      email: '',
      role: ''
    });

    setOpen(false);
  };

  const handleEdit = (id) => {
    const admin = admins.find((admin) => admin.id === id);
    setAdminDetails({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    });
    setSelectedAdminId(id);
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    const admin = admins.find((admin) => admin.id === id);
    setAdminToDelete(admin);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admins/${adminToDelete.id}`);
      setAdmins(admins.filter((admin) => admin.id !== adminToDelete.id));
      setDeleteConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleCancelDelete = () => {
    setAdminToDelete(null);
    setDeleteConfirmationOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'password', headerName: 'Password', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h2">
          Admin Management
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add Admin
        </Button>
      </Box>
      <Box display="flex" flexDirection="column">
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{editMode ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={adminDetails.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={adminDetails.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  value={adminDetails.email}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    value={adminDetails.role}
                    onChange={handleInputChange}
                    name="role"
                    required
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Nutritionist">Nutritionist</MenuItem>
                    <MenuItem value="Health Worker">Health Worker</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editMode ? 'Update Admin' : 'Add Admin'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteConfirmationOpen}
          onClose={handleCancelDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete {adminToDelete ? `${adminToDelete.firstName} ${adminToDelete.lastName}` : ''}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Box mt={4} style={{ height: 400, width: '100%' }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Accounts
          </Typography>
          <DataGrid rows={admins} columns={columns} pageSize={5} />
        </Box>
      </Box>
    </Box>
  );
}

export default Admin;
