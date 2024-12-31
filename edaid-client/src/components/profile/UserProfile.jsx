import { useState } from 'react';
import { TextField, Button, Paper, Box } from '@mui/material';

const UserProfile = () => {
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    const handleUpdate = async () => {
        try {
            await api.put('/user/profile', profile);
            // Handle success
        } catch (error) {
            // Handle error
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box component="form">
                <TextField
                    label="First Name"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                />
                {/* Other fields */}
                <Button onClick={handleUpdate}>Update Profile</Button>
            </Box>
        </Paper>
    );
};

export default UserProfile;