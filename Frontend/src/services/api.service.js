import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api'; // Đổi theo backend bạn

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 300000,
});

export const apiService = {
  get(url, config = {}) {
    return axiosInstance.get(url, config).then(res => res.data);
  },

  post(url, data = {}, config = {}) {
    return axiosInstance.post(url, data, config).then(res => res.data);
  },

  put(url, data = {}, config = {}) {
    return axiosInstance.put(url, data, config).then(res => res.data);
  },

  delete(url, config = {}) {
    return axiosInstance.delete(url, config).then(res => res.data);
  },

  patch(url, data = {}, config = {}) { // <-- Thêm method patch
    return axiosInstance.patch(url, data, config).then(res => res.data);
  },
};
