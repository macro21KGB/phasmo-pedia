export const submitQueryStream = async (query: string) => {
  const response = await fetch('http://localhost:5656/submit_query_stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query_text: query }),
  });
  return response;
};
