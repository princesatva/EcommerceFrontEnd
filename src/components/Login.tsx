import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  message,
  Layout,
  Checkbox,
  InputNumber,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  HomeOutlined,
  GlobalOutlined,
  WalletOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { getCustomerByEmail, login, getSellersByEmail } from "../api/Auth/auth";
import { updateSeller } from "../api/Seller/seller";
import "../styles/Login/login.css";
import { updateCustomer } from "../api/Customer/customer";

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const loginPayload = {
        Email: values.email,
        Password: values.password,
      };

      const response = await login(loginPayload);

      // Store tokens
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      const payload = parseJwt(response.data.accessToken);
      const role =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      setUserRole(role);
      setUserEmail(values.email);
      setAccessToken(response.data.accessToken);

      // Check if user is approved
      if (role === "2" || role === "3") {
        // Customer or Seller
        try {
          let userData;

          if (role === "2") {
            // If customer, get customer data
            userData = await getCustomerByEmail(
              values.email,
              response.data.accessToken
            );
          } else if (role === "3") {
            // If seller, get seller data
            userData = await getSellersByEmail(
              values.email,
              response.data.accessToken
            );
          }

          if (userData && userData.data) {
            if (userData.data.isApproved) {
              // If approved, navigate to role page
              let rolePath = "";
              if (role === "1") {
                rolePath = "admin";
              } else if (role === "2") {
                rolePath = "customer";
              } else if (role === "3") {
                rolePath = "seller";
              }

              message.success(response.message || "Login successful");
              navigate(`/${rolePath}`);
            } else {
              // If not approved, show profile completion form
              setShowProfileForm(true);
              setUserId(userData.data.id); // Store the user ID for update
            }
          } else {
            // If no user data found, show profile completion form
            setShowProfileForm(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If error fetching data, assume not approved and show form
          setShowProfileForm(true);
        }
      } else {
        // For admin or other roles, navigate directly
        let rolePath = role === "1" ? "admin" : "";
        message.success(response.message || "Login successful");
        navigate(`/${rolePath}`);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message || "Login Failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (values: any) => {
    setLoading(true);

    try {
      let updatedUserData = null;

      if (userRole === "2") {
        // Customer
        const customerData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: userEmail,
          phoneNumber: values.phoneNumber,
          city: values.city,
          country: values.country,
          address: values.address,
          walletAmount: values.walletAmount || 0,
          isSupplier: values.isSupplier || false,
        };

        if (userId !== null) {
          await updateCustomer(userId, customerData, accessToken);
          // Get updated customer data to check approval status
          updatedUserData = await getCustomerByEmail(userEmail, accessToken);
        } else {
          // Try to fetch customer ID again
          try {
            const customerResponse = await getCustomerByEmail(
              userEmail,
              accessToken
            );
            if (customerResponse && customerResponse.data) {
              await updateCustomer(
                customerResponse.data.id,
                customerData,
                accessToken
              );
              updatedUserData = await getCustomerByEmail(
                userEmail,
                accessToken
              );
            } else {
              throw new Error("Customer ID not found");
            }
          } catch (error) {
            console.error("Error fetching customer:", error);
            throw new Error("Customer ID not found");
          }
        }
      } else if (userRole === "3") {
        // Seller
        const sellerData = {
          name: `${values.firstName} ${values.lastName}`,
          email: userEmail,
          phoneNumber: values.phoneNumber,
          companyName: values.companyName || "",
          city: values.city,
          walletAmount: values.walletAmount || 0,
          isCustomer: values.isCustomer || false,
        };

        if (userId !== null) {
          await updateSeller(userId, sellerData, accessToken);
          // Get updated seller data to check approval status
          updatedUserData = await getSellersByEmail(userEmail, accessToken);
        } else {
          // Try to fetch seller ID again
          try {
            const sellerResponse = await getSellersByEmail(
              userEmail,
              accessToken
            );
            console.log("Seller response:", sellerResponse); // Debug log

            if (
              sellerResponse &&
              sellerResponse.data &&
              sellerResponse.data.id
            ) {
              await updateSeller(
                sellerResponse.data.id,
                sellerData,
                accessToken
              );
              updatedUserData = await getSellersByEmail(userEmail, accessToken);
            } else if (
              sellerResponse &&
              Array.isArray(sellerResponse.data) &&
              sellerResponse.data.length > 0
            ) {
              // Handle case where API returns an array of sellers
              await updateSeller(
                sellerResponse.data[0].id,
                sellerData,
                accessToken
              );
              updatedUserData = await getSellersByEmail(userEmail, accessToken);
            } else {
              throw new Error("Seller ID not found in response");
            }
          } catch (error) {
            console.error("Error fetching seller:", error);
            throw new Error("Seller ID not found");
          }
        }
      }

      message.success("Profile updated successfully!");

      // Show appropriate message and stay on login screen if not approved
      message.info(
        "Your profile has been submitted. You will be notified when your account is approved."
      );

      // Reset form and go back to login screen
      setTimeout(() => {
        setShowProfileForm(false);
      }, 3000);
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Profile update failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const skipProfileUpdate = () => {
    message.info(
      "Your request is pending for approval. You will be notified when your account is approved."
    );
    setShowProfileForm(false); // Return to login screen
  };

  const parseJwt = (token: any) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return {};
    }
  };

  // Login form
  const renderLoginForm = () => (
    <Card className="login-card">
      <div className="login-title">
        <Title level={2}>E-Commerce Platform</Title>
        <Divider />
        <Title level={4} className="login-subtitle">
          Sign In
        </Title>
      </div>

      <Form
        name="login"
        initialValues={{ role: "customer" }}
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={loading}
          >
            Sign In
          </Button>
        </Form.Item>
        <Divider plain>New user?</Divider>
        <Button type="link" onClick={() => navigate("/register")} block>
          Register
        </Button>
      </Form>
    </Card>
  );

  // Profile completion form for Customer
  const renderCustomerProfileForm = () => (
    <Card className="login-card">
      <div className="login-title">
        <Title level={2}>Complete Your Profile</Title>
        <Divider />
        <Title level={4} className="login-subtitle">
          Customer Information
        </Title>
        <Text type="secondary">
          Complete your profile information (Approval required before access)
        </Text>
      </div>

      <Form
        name="customerProfile"
        onFinish={onProfileSubmit}
        layout="vertical"
        size="large"
        initialValues={{ email: userEmail }}
      >
        <Form.Item name="email">
          <Input prefix={<MailOutlined />} placeholder="Email" disabled />
        </Form.Item>

        <Form.Item
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          rules={[
            { required: true, message: "Please input your phone number!" },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
        </Form.Item>

        <Form.Item
          name="address"
          rules={[{ required: true, message: "Please input your address!" }]}
        >
          <Input prefix={<HomeOutlined />} placeholder="Address" />
        </Form.Item>

        <Form.Item
          name="city"
          rules={[{ required: true, message: "Please input your city!" }]}
        >
          <Input prefix={<GlobalOutlined />} placeholder="City" />
        </Form.Item>

        <Form.Item
          name="country"
          rules={[{ required: true, message: "Please input your country!" }]}
        >
          <Input prefix={<GlobalOutlined />} placeholder="Country" />
        </Form.Item>

        <Form.Item
          name="walletAmount"
          rules={[{ required: true, message: "Please input wallet amount!" }]}
          initialValue={0}
        >
          <InputNumber
            prefix={<WalletOutlined />}
            placeholder="Wallet Amount"
            style={{ width: "100%" }}
            min={0}
          />
        </Form.Item>

        <Form.Item name="isSupplier" valuePropName="checked">
          <Checkbox>Register as Supplier</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "48%" }}
            >
              Complete Profile
            </Button>
            <Button onClick={skipProfileUpdate} style={{ width: "48%" }}>
              Skip for Now
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Profile completion form for Seller
  const renderSellerProfileForm = () => (
    <Card className="login-card">
      <div className="login-title">
        <Title level={2}>Complete Your Profile</Title>
        <Divider />
        <Title level={4} className="login-subtitle">
          Seller Information
        </Title>
        <Text type="secondary">
          Complete your profile information (Approval required before access)
        </Text>
      </div>

      <Form
        name="sellerProfile"
        onFinish={onProfileSubmit}
        layout="vertical"
        size="large"
        initialValues={{ email: userEmail }}
      >
        <Form.Item name="email">
          <Input prefix={<MailOutlined />} placeholder="Email" disabled />
        </Form.Item>

        <Form.Item
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          rules={[
            { required: true, message: "Please input your phone number!" },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
        </Form.Item>

        <Form.Item name="companyName">
          <Input
            prefix={<HomeOutlined />}
            placeholder="Company Name (Optional)"
          />
        </Form.Item>

        <Form.Item
          name="city"
          rules={[{ required: true, message: "Please input your city!" }]}
        >
          <Input prefix={<GlobalOutlined />} placeholder="City" />
        </Form.Item>

        <Form.Item
          name="walletAmount"
          rules={[{ required: true, message: "Please input wallet amount!" }]}
          initialValue={0}
        >
          <InputNumber
            prefix={<WalletOutlined />}
            placeholder="Wallet Amount"
            style={{ width: "100%" }}
            min={0}
          />
        </Form.Item>

        <Form.Item name="isCustomer" valuePropName="checked">
          <Checkbox>Register as Customer</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "48%" }}
            >
              Complete Profile
            </Button>
            <Button onClick={skipProfileUpdate} style={{ width: "48%" }}>
              Skip for Now
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <Layout className="login-layout" style={{ paddingTop: "100px" }}>
      <Content className="flex items-center justify-center p-4">
        {!showProfileForm && renderLoginForm()}
        {showProfileForm && userRole === "2" && renderCustomerProfileForm()}
        {showProfileForm && userRole === "3" && renderSellerProfileForm()}
      </Content>
    </Layout>
  );
};

export default Login;
