import axios from "axios";

const baseURL = import.meta.env.API_BASE_URL as string;

const api = axios.create({
  baseURL: baseURL,
});

export const updateSeller = async (
  id: number,
  updateData: {
    name: string;
    email: string;
    phoneNumber?: string;
    companyName?: string;
    city?: string;
    walletAmount: number;
    isCustomer: boolean;
  },
  accessToken: string
) => {
  const response = await api.patch(`/Seller/update/${id}`, updateData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getSellers = async ({
  search,
  pageNumber = 1,
  pageSize = 10,
  isApproved,
  accessToken,
}: {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  isApproved?: boolean;
  accessToken?: string;
}) => {
  const response = await api.get("/Seller/getSellers", {
    params: {
      search,
      pageNumber,
      pageSize,
      isApproved,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getAllProducts = async ({
  search,
  sort = "asc",
  minPrice,
  maxPrice,
  category,
  pageNumber = 1,
  pageSize = 10,
  accessToken,
}: {
  search?: string;
  sort?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  pageNumber?: number;
  pageSize?: number;
  accessToken?: string;
}) => {
  const response = await api.get("/Product/getAllProducts", {
    params: {
      search,
      sort,
      minPrice,
      maxPrice,
      category,
      pageNumber,
      pageSize,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const createProduct = async (
  product: {
    name: string;
    price: number;
    description?: string;
    category?: string;
    quantity?: number;
    imageUrl: string;
    isActive: boolean;
    SellerId: number;
  },
  accessToken?: string
) => {
  const response = await api.post(
    "/Product/createProduct",
    {
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      SellerId: product.SellerId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getProductCategories = async (accessToken?: string) => {
  const response = await api.get("/Product/categories", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const updateProduct = async (
  id: number,
  productData: any,
  accessToken?: string
) => {
  const response = await api.put(`/Product/updateProduct/${id}`, productData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const deleteProduct = async (id: number, accessToken?: string) => {
  const response = await api.delete(`/Product/deleteProduct/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getProductsBySeller = async ({
  sellerId,
  search,
  sort = "asc",
  category,
  pageNumber = 1,
  pageSize = 10,
  accessToken,
}: {
  sellerId: number;
  search?: string;
  sort?: "asc" | "desc";
  category?: string;
  pageNumber?: number;
  pageSize?: number;
  accessToken?: string;
}) => {
  const response = await api.get("/Product/getProductsBySeller", {
    params: {
      sellerId,
      search,
      sort,
      category,
      pageNumber,
      pageSize,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
