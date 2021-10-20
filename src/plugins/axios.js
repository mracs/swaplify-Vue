import axios from 'axios';

export default axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
