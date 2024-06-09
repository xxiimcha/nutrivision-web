import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Grid, Snackbar, List, ListItem, ListItemText, Paper
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';

const localizer = momentLocalizer(moment);

const initialFormData = {
  title: '',
  time: '',
  location: '',
  recipient: 'all',
};

const eventTitleOptions = [
  { value: 'feeding_program', label: 'Feeding Program' },
  { value: 'check_up', label: 'Check-up' },
  // Add more options as needed
];

const locationOptions = [
  { value: 'barangay_health_center', label: 'Barangay Health Center' },
  { value: 'barangay_hall', label: 'Barangay Hall' },
  // Add more options as needed
];

function Calendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [editingEvent, setEditingEvent] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleDateSelect = (e) => {
    setShowModal(true);
    setSelectedDate(e.start);
    setEditingEvent(null); // Reset editing state
    setFormData(initialFormData);
  };

  const handleEditEvent = (event) => {
    setShowModal(true);
    setSelectedDate(event.start);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      time: moment(event.start).format('HH:mm'),
      location: event.location,
      recipient: event.recipient,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = () => {
    const updatedEvent = {
      title: formData.title,
      start: selectedDate,
      end: selectedDate,
      time: formData.time,
      location: formData.location,
      recipient: formData.recipient,
    };

    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map((event) => {
        if (event === editingEvent) {
          return { ...event, ...updatedEvent };
        }
        return event;
      });
      setEvents(updatedEvents);
      setSnackbarOpen(true); // Display snackbar message
    } else {
      // Add new event
      setEvents([...events, updatedEvent]);
    }

    setFormData(initialFormData);
    setShowModal(false);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter((event) => event !== editingEvent);
    setEvents(updatedEvents);
    setFormData(initialFormData);
    setShowModal(false);
  };

  return (
    <Box display="flex" height="800px" padding={2}>
      <Box width="70%">
        <Typography variant="h4" gutterBottom style={{ marginBottom: '20px' }}>
          Event Calendar
        </Typography>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '600px', width: '100%' }}
            selectable
            onSelectSlot={handleDateSelect}
            onSelectEvent={handleEditEvent}
            components={{
              toolbar: (props) => <Toolbar {...props} />,
            }}
          />
        </Paper>
      </Box>
      <Box width="30%" padding={2}>
        <Typography variant="h5" gutterBottom>
          Event List
        </Typography>
        <Paper elevation={3} style={{ padding: '20px', height: '600px', overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
          <List>
            {events.map((event, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid #ddd', '&:last-child': { borderBottom: 'none' } }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>Date:</strong> {moment(event.start).format('MMMM Do YYYY')} <br />
                        <strong>Time:</strong> {moment(event.start).format('h:mm A')} <br />
                        <strong>Location:</strong> {event.location} <br />
                        <strong>Recipient:</strong> {event.recipient}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxWidth: 400,
            width: '90%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" gutterBottom>
            {editingEvent ? 'Edit Event' : 'Add Event'}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Title</InputLabel>
            <Select
              value={formData.title}
              onChange={handleFormChange}
              name="title"
            >
              {eventTitleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Location</InputLabel>
            <Select
              value={formData.location}
              onChange={handleFormChange}
              name="location"
            >
              {locationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                name="time"
                label="Time"
                type="time"
                value={formData.time}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Recipient</InputLabel>
                <Select
                    value={formData.recipient}
                    onChange={handleFormChange}
                    name="recipient"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="users">Users</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFormSubmit}
                  fullWidth
                  style={{ marginTop: '20px' }}
                >
                  {editingEvent ? 'Save' : 'Add'}
                </Button>
              </Grid>
              {editingEvent && (
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDeleteEvent}
                    fullWidth
                    style={{ marginTop: '20px' }}
                  >
                    Delete
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        </Modal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message="Changes saved"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          style={{ position: 'fixed', bottom: '20px', left: '20px' }}
        />
      </Box>
    );
  }
  
  // Custom Toolbar component for BigCalendar
  const Toolbar = ({ label, onNavigate }) => {
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
  
    const handleMonthClick = () => {
      setShowMonthPicker(true);
      setShowYearPicker(false);
    };
  
    const handleYearClick = () => {
      setShowMonthPicker(false);
      setShowYearPicker(true);
    };
  
    const handleMonthSelect = (month) => {
      const currentDate = moment(label, 'MMMM YYYY');
      onNavigate('DATE', currentDate.month(month).toDate());
      setShowMonthPicker(false);
    };
  
    const handleYearSelect = (year) => {
      const currentDate = moment(label, 'MMMM YYYY');
      onNavigate('DATE', currentDate.year(year).toDate());
      setShowYearPicker(false);
    };
  
    const months = moment.months();
    const years = Array.from({ length: 20 }, (_, i) => moment().year() - 10 + i);
  
    return (
      <Grid container justifyContent="space-between" alignItems="center" style={{ marginBottom: '10px' }}>
        <Grid item>
          <IconButton onClick={() => onNavigate('PREV')}>
            <ChevronLeftIcon />
          </IconButton>
        </Grid>
        <Grid item>
          {showMonthPicker ? (
            <Select
              native
              value={moment(label, 'MMMM YYYY').month()}
              onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </Select>
          ) : showYearPicker ? (
            <Select
              native
              value={moment(label, 'MMMM YYYY').year()}
              onChange={(e) => handleYearSelect(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          ) : (
            <Typography variant="h6" onClick={handleMonthClick} style={{ cursor: 'pointer' }}>
              {label}
            </Typography>
          )}
        </Grid>
        <Grid item>
          <IconButton onClick={() => onNavigate('NEXT')}>
            <ChevronRightIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };
  
  export default Calendar;
  