import axios from 'axios';
import { QueryResponse, SubmitQueryRequest } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:5656',
  headers: {
    'Content-type': 'application/json',
  },
});

export const submitQuery = async (query: string): Promise<QueryResponse> => {
  const request: SubmitQueryRequest = { query_text: query };
  const response = await apiClient.post<QueryResponse>(
    '/submit_query',
    request
  );
  return response.data;
};
