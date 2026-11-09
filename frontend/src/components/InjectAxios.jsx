
import { useEffect } from 'react';
import axios from 'axios';

import { useLocation } from 'react-router';

import useAuth from 'hooks/useAuth';
import useApp from 'hooks/useApp';

axios.defaults.baseURL = import.meta.env.VITE_API_PATH;
axios.defaults.headers.post['Content-Type'] = 'application/json';

export function InjectAxios() {
    const auth = useAuth();
    const app = useApp();
    const location = useLocation();
    useEffect(() => {
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (auth) {
                    const path = window.location.pathname;
                    if (error?.request?.status === 401 && path !== "/") {
                        app.flashMsg("Unable to complete the request", error.request?.response, 'error');
                        return auth.logout(path);
                    }
                }

                // reject error. Error will be handle by calling page.
                throw error;
            }
        );
    }, []);

    useEffect(() => {
        app.closeDialogs();
    }, [location])
}