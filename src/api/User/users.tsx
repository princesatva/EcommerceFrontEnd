import axios from "axios";

const baseURL = import.meta.env.API_BASE_URL as string;

const api = axios.create({
  baseURL: baseURL,
});

export const getUsers = async (params: {
  search?: string;
  roleId?: number;
  pageNumber?: number;
  pageSize?: number;
  accessToken: string;
}) => {
  const { search, roleId, pageNumber = 1, pageSize = 10, accessToken } = params;

  const response = await api.get("User/users", {
    params: {
      search,
      roleId,
      pageNumber,
      pageSize,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const createUser = async (
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

export const updateUser = async (
  userId: number,
  updateData: {
    userName?: string;
    email?: string;
    roleId?: number;
    isActive?: boolean;
  },
  accessToken: string
) => {
  const response = await api.patch(`User/update/${userId}`, updateData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const deactivateUser = async (userId: number, accessToken: string) => {
  const response = await api.post(`User/deactivateUser/${userId}`, null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const approveUser = async (
  userId: number,
  role: string,
  accessToken?: string
) => {
  const response = await api.post(
    `/Admin/approveUser`,
    {},
    {
      params: { userId, role },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};
