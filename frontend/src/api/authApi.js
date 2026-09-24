import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const res = await axiosClient.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    return res.data;
  },

  getMe: async () => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await axiosClient.put('/auth/profile', profileData);
    return res.data;
  },
};
