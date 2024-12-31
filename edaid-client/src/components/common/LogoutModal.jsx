import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';

const LogoutModal = ({ open, onClose, onConfirm }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} color="error">Logout</Button>
        </DialogActions>
    </Dialog>
);

export default LogoutModal;