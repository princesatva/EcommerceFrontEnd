import axios from "axios";

const baseURL = import.meta.env.API_BASE_URL as string;

const api = axios.create({
  baseURL: baseURL,
});

export const login = async (credentials: any) => {
  const response = await api.post("User/login", credentials);
  return response.data;
};

export const logout = async (accessToken: any) => {
  const response = await api.post(
    "User/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const register = async (
  userData: {
    userName: string;
    email: string;
    password: string;
    role: number;
  },
  accessToken: string
) => {
  const response = await api.post("User/register", userData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getCustomerByEmail = async (
  email: string,
  accessToken: string
) => {
  const response = await api.get(`/Customer/byEmail`, {
    params: { email },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getSellersByEmail = async (email: string, accessToken: string) => {
  const response = await api.get(`/Seller/byEmail`, {
    params: { email },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
