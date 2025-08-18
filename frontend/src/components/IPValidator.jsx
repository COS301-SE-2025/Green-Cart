import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export const IPValidator = ({ children }) => {
    const navigate = useNavigate();
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/validate-ip`);
                if (!response.ok) {
                    navigate('/unauthorized');
                } else {
                    setIsAllowed(true);
                }
            } catch (error) {
                console.error('IP validation failed:', error);
                navigate('/unauthorized');
            }
        };

        checkAccess();
    }, [navigate]);

    return isAllowed ? children : null;
};