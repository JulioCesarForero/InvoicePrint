import axios from 'axios';
import useLocalStore from 'hooks/useLocalStore';
function useApi() {
    const localStore = useLocalStore();
    // If token exists set header
    let token = localStore.getToken();
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }

    return {
        removeHeader() {
            axios.defaults.headers.common = {}
        },
        get(apiPath) {
            return axios.get(apiPath)
        },

        download(apiPath) {
            return axios({
                url: apiPath,
                method: 'GET',
                responseType: 'blob', // important
            })
        },
        post(apiPath, data) {
            return axios.post(apiPath, data);
        },

        put(apiPath, formData) {
            return axios.put(apiPath, formData)
        },

        delete(apiPath) {
            return axios.delete(apiPath)
        },
        customRequest(data) {
            return axios(data)
        },
        axios() {
            return axios;
        },
    }
}
export default useApi;