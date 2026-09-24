import axiosClient from './axiosClient';

export const interviewApi = {
  createInterview: async (data) => {
    const res = await axiosClient.post('/interviews', data);
    return res.data;
  },

  getUserInterviews: async () => {
    const res = await axiosClient.get('/interviews');
    return res.data;
  },

  getQuestions: async (interviewId) => {
    const res = await axiosClient.get(`/interviews/${interviewId}/questions`);
    return res.data;
  },

  submitAnswer: async (interviewId, answerData) => {
    const res = await axiosClient.post(`/interviews/${interviewId}/answer`, answerData);
    return res.data;
  },

  completeInterview: async (interviewId) => {
    const res = await axiosClient.post(`/interviews/${interviewId}/complete`);
    return res.data;
  },

  getReport: async (interviewId) => {
    const res = await axiosClient.get(`/interviews/${interviewId}/report`);
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await axiosClient.get('/analytics/dashboard');
    return res.data;
  },

  uploadResume: async (formData) => {
    const res = await axiosClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getCurrentResume: async () => {
    const res = await axiosClient.get('/resume/current');
    return res.data;
  },

  getResumeFeedback: async (data) => {
    const res = await axiosClient.post('/resume/feedback', data);
    return res.data;
  },
};
