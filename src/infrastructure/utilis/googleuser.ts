
import axios from "axios";

export const getUserFromGoogle = async (token: string): Promise<{ email: string; name: string; id: string }> => {
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      email: data.email,
      name: data.name,
      id: data.id,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};