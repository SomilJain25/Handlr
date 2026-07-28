import axios from 'axios';

const API_BASE = (import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5000/graphql').replace(
  '/graphql',
  ''
);

const uploadFile = async (endpoint, file, onProgress) => {
  const token = localStorage.getItem('handlr_access_token');
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(`${API_BASE}/api/upload/${endpoint}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });

  return data; // { url, publicId }
};

export const uploadAvatar = (file, onProgress) => uploadFile('avatar', file, onProgress);
export const uploadResume = (file, onProgress) => uploadFile('resume', file, onProgress);
export const uploadPortfolioImage = (file, onProgress) =>
  uploadFile('portfolio-image', file, onProgress);
export const uploadCompanyLogo = (file, onProgress) =>
  uploadFile('company-logo', file, onProgress);