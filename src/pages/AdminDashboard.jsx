import React, { useState } from 'react';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PhotoManagement from '../components/PhotoManagement';
import BlogManagement from '../components/BlogManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Admin Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="admin sections tabs">
        <Tab label="Photo Management" />
        <Tab label="Blog Management" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && <PhotoManagement />}
        {selectedTab === 1 && <BlogManagement />}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
