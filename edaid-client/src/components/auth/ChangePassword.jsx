import { useState } from 'react';
import { auth } from '../../utils/firebase';
import { updatePassword } from 'firebase/auth';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    
    const handlePasswordChange = async () => {
        try {
            const user = auth.currentUser;
            await updatePassword(user, newPassword);
            // Handle success
        } catch (error) {
            // Handle error
        }
    };

    return (
        <div>
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
            />
            <button onClick={handlePasswordChange}>Change Password</button>
        </div>
    );
};

export default ChangePassword;