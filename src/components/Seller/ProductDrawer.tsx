import { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  Switch,
  Typography,
  message,
  Space,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { getSellersByEmail } from "../../api/Auth/auth";
import {
  createProduct,
  getProductCategories,
  updateProduct,
} from "../../api/Seller/seller";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const parseJwt = (token: any) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    return {};
  }
};

const ProductDrawer = ({
  visible,
  onClose,
  onSuccess,
  productToEdit = null,
}: any) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [categories, setCategories] = useState<any>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories when drawer opens
  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  // Initialize form with product data if editing
  useEffect(() => {
    if (visible) {
      form.resetFields();

      if (productToEdit) {
        form.setFieldsValue({
          name: productToEdit.name,
          description: productToEdit.description,
          category: productToEdit.category,
          price: productToEdit.price,
          quantity: productToEdit.quantity,
          imageUrl: productToEdit.imageUrl,
          isActive: productToEdit.isActive || true,
        });
      } else {
        // Set default values for new product
        form.setFieldsValue({
          isActive: true,
        });
      }

      // Get seller ID from JWT token
      fetchSellerId();
    }
  }, [visible, productToEdit, form]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("Not authenticated");
        return;
      }

      const response: any = await getProductCategories(accessToken);
      // Check if response has a data property that is an array
      if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error("Invalid categories data:", response);
        message.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load product categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSellerId = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("Not authenticated");
        return;
      }

      // Decode JWT token to get email
      const payload = parseJwt(accessToken);
      const email =
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ];

      if (!email) {
        message.error("Email not found in token");
        return;
      }

      // Fetch seller by email
      const response = await getSellersByEmail(email, accessToken);

      // Check for data property in the response
      if (
        response &&
        response.status === 200 &&
        response.data &&
        response.data.id
      ) {
        setSellerId(response.data.id);
      } else {
        console.error("Invalid seller data:", response);
        message.error("Seller information not found");
      }
    } catch (error) {
      console.error("Error fetching seller ID:", error);
      message.error("Failed to get seller information");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("Not authenticated");
        setLoading(false);
        return;
      }

      if (!sellerId) {
        message.error("Seller ID not found");
        setLoading(false);
        return;
      }

      const productData = {
        ...values,
        isActive: values.isActive || true,
        SellerId: sellerId,
      };

      // If editing a product, include the ID
      if (productToEdit) {
        productData.id = productToEdit.id;
        // Call update product API (not provided in the question)
        await updateProduct(productToEdit.id, productData, accessToken);
        message.success("Product updated successfully");
      } else {
        // Create new product
        await createProduct(productData, accessToken);
        message.success("Product created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving product:", error);
      if (error.message && error.message.includes("validation")) {
        message.error("Please check the form fields");
      } else {
        message.error("Failed to save product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <Title level={4}>
          {productToEdit ? "Edit Product" : "Add New Product"}
        </Title>
      }
      placement="right"
      width={520}
      onClose={onClose}
      open={visible}
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={onClose} icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={<SaveOutlined />}
            >
              {productToEdit ? "Update" : "Create"}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        name="productForm"
        initialValues={{ isActive: true }}
      >
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: "Please enter product name" }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            placeholder="Enter product description"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item name="category" label="Category">
          <Select
            placeholder="Select a category"
            allowClear
            loading={loadingCategories}
          >
            {categories.map((category: any) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: "Please enter product price" }]}
        >
          <InputNumber
            placeholder="0.00"
            style={{ width: "100%" }}
            min={0}
            precision={2}
            prefix="$"
          />
        </Form.Item>

        <Form.Item name="quantity" label="Quantity" initialValue={0}>
          <InputNumber
            placeholder="0"
            style={{ width: "100%" }}
            min={0}
            precision={0}
          />
        </Form.Item>

        <Form.Item name="imageUrl" label="Image URL">
          <Input placeholder="Enter image URL" />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active Status"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ProductDrawer;
