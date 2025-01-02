import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
} from '@mui/material';
import {
    Dashboard,
    People,
    School,
    AssignmentTurnedIn,
    Settings,
    Description
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const drawerWidth = 240;

    // Define navigation items based on user role
    const getNavItems = (role) => {
        const items = {
            admin: [
                { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
                { text: 'Users', icon: <People />, path: '/admin/users' },
                { text: 'Applications', icon: <AssignmentTurnedIn />, path: '/admin/applications' },
                { text: 'Settings', icon: <Settings />, path: '/admin/settings' }
            ],
            reviewer: [
                { text: 'Dashboard', icon: <Dashboard />, path: '/reviewer/dashboard' },
                { text: 'Review Applications', icon: <AssignmentTurnedIn />, path: '/reviewer/applications' }
            ],
            student: [
                { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
                { text: 'Scholarships', icon: <School />, path: '/student/scholarships' },
                { text: 'My Applications', icon: <Description />, path: '/student/applications' }
            ]
        };

        return items[role] || [];
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    ...(!open && {
                        width: theme => theme.spacing(7),
                        overflowX: 'hidden'
                    })
                },
            }}
            open={open}
        >
            <Toolbar />
            <Divider />
            <List>
                {getNavItems(user?.role).map((item) => (
                    <ListItemButton
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
