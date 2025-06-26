import axios from "axios";
import { access } from "fs";

const baseURL = import.meta.env.API_BASE_URL as string;

const api = axios.create({
  baseURL: baseURL,
});

export const updateCustomer = async (
  id: number,
  updateData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    city: string;
    country: string;
    walletAmount: number;
    isSupplier: boolean;
  },
  accessToken: string
) => {
  const response = await api.patch(`/Customer/update/${id}`, updateData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getCustomers = async (
  search: string = "",
  pageNumber: number = 1,
  pageSize: number = 10,
  isApproved?: boolean,
  accessToken?: string
) => {
  const response = await api.get("/Customer/getCustomers", {
    params: { search, pageNumber, pageSize, isApproved, accessToken },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const addToCart = async ({
  productId,
  customerId,
  quantity,
  accessToken,
}: {
  productId: number;
  customerId: number;
  quantity: number;
  accessToken?: string;
}) => {
  const response = await api.post(
    "/Cart/addToCart",
    {
      productId,
      customerId,
      quantity,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getCartItems = async ({
  customerId,
  accessToken,
}: {
  customerId: number;
  accessToken?: string;
}) => {
  const response = await api.get(`/Cart/${customerId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const removeCartItem = async ({
  customerId,
  productId,
  accessToken,
}: {
  customerId: number;
  productId: number;
  accessToken?: string;
}) => {
  const response = await api.delete("/Cart/removeItem", {
    params: {
      customerId,
      productId,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const placeOrder = async ({
  customerId,
  accessToken,
}: {
  customerId: number;
  accessToken?: string;
}) => {
  const response = await api.post(`/Order/place/${customerId}`, null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getPendingOrderItemsByCustomerId = async ({
  customerId,
  accessToken,
}: {
  customerId: number;
  accessToken?: string;
}) => {
  const response = await api.get(
    `/Order/customer/${customerId}/items/pending`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};
