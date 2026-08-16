import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

export async function generateStyleNotes(userQuery, products, searchMode = 'text') {
  const text = `
    You are an AI fashion stylist.

    User query: ${userQuery}

    Product metadata:

    Category: ${products.category}
    Color: ${products.color}
    Material: ${products.material}
    Fit: ${products.fit}
    Season: ${products.season}

    Explain why this product matches the user's request.

    Rules:
    • Mention only information present in the metadata.
    • Do not invent features.
    • Keep the explanation concise.
    • Focus on attributes relevant to the user's query.
    • Return a style note only.
  `

  const requestBody = {
    model: "nvidia/nemotron-3-nano-30b-a3b:free",
    messages: [
      { role: "user", content: text }
    ]
  };

 const response = await apiClient.post('', requestBody);
  return response.data.choices[0].message.content;
}

export default apiClient
