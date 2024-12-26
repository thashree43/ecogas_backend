
import axios from "axios";

export const getUserFromGoogle = async (token: string): Promise<{ email: string; name: string; id: string }> => {
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        },
      }
    );

    if (!data.email || !data.name || !data.id) {
      throw new Error('Invalid Google user data received');
    }

    return {
      email: data.email,
      name: data.name,
      id: data.id,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Google API Error:", {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    throw new Error('Failed to fetch Google user data');
  }
};