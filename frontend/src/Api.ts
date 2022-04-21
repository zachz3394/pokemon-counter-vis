import axios from 'axios';

export const getGen = (gen: string) => {
  return axios.get(`http://localhost:8000/gens/${gen}`).then(res => res.data);
}