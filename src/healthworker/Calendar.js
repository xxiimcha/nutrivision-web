import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Grid, Snackbar, Card, CardContent, CardActions, IconButton, Modal, Paper
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const initialFormData = {
  title: '',
  date: moment().format('YYYY-MM-DD'),
  time: '',
  location: '',
  recipient: 'all',
};

function Calendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [editingEvent, setEditingEvent] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch events from the backend when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const fetchedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleDateSelect = (e) => {
    const today = moment().startOf('day');
    const selected = moment(e.start).startOf('day');

    if (selected.isBefore(today)) {
      return;
    }

    setShowModal(true);
    setSelectedDate(e.start);
    setEditingEvent(null);
    setFormData({ ...initialFormData, date: moment(e.start).format('YYYY-MM-DD') });
  };

  const handleEditEvent = (event) => {
    setShowModal(true);
    setSelectedDate(event.start);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: moment(event.start).format('YYYY-MM-DD'),
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

  const saveEventToBackend = async (event) => {
    try {
      if (editingEvent) {
        await axios.put(`http://localhost:5000/api/events/${editingEvent._id}`, event);
      } else {
        await axios.post('http://localhost:5000/api/events', event);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleFormSubmit = async () => {
    const updatedEvent = {
      title: formData.title,
      date: formData.date,
      start: moment(`${formData.date} ${formData.time}`).toISOString(),
      end: moment(`${formData.date} ${formData.time}`).toISOString(),
      time: formData.time,
      location: formData.location,
      recipient: formData.recipient,
    };

    if (editingEvent) {
      const updatedEvents = events.map((event) => {
        if (event === editingEvent) {
          return { ...event, ...updatedEvent };
        }
        return event;
      });
      setEvents(updatedEvents);
      setSnackbarOpen(true);
    } else {
      setEvents([...events, updatedEvent]);
    }

    await saveEventToBackend(updatedEvent);
    setFormData(initialFormData);
    setShowModal(false);
  };

  const deleteEventFromBackend = async (event) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${event._id}`);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    const updatedEvents = events.filter((event) => event !== editingEvent);
    setEvents(updatedEvents);

    await deleteEventFromBackend(editingEvent);
    setFormData(initialFormData);
    setShowModal(false);
  };

  const dayPropGetter = (date) => {
    const today = moment().startOf('day');
    const dateToCompare = moment(date).startOf('day');

    if (dateToCompare.isBefore(today)) {
      return {
        style: {
          backgroundColor: '#f0f0f0',
          color: '#d0d0d0',
          cursor: 'not-allowed',
        },
      };
    }
    return {};
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
            dayPropGetter={dayPropGetter}
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
          {events.map((event, index) => (
            <Card key={index} sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {event.title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {moment(event.start).format('MMMM Do YYYY, h:mm A')}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {event.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Recipient:</strong> {event.recipient}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton color="primary" onClick={() => handleEditEvent(event)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDeleteEvent(event)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
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
          <TextField
            fullWidth
            margin="normal"
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="date"
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleFormChange}
            InputProps={{
              inputProps: {
                min: moment().format('YYYY-MM-DD'),
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleFormChange}
          />
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
