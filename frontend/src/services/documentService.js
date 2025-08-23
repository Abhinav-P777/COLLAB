import axios from 'axios';

const API_URL = 'http://localhost:5000/api/documents';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user ? user.token : null;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllDocuments = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const createDocument = async (documentData) => {
  const response = await axios.post(API_URL, documentData, getAuthHeaders());
  return response.data;
};

export const updateDocument = async (id, documentData) => {
  const response = await axios.put(`${API_URL}/${id}`, documentData, getAuthHeaders());
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};
