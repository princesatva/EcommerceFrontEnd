import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  message,
  Layout,
  Select,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import "../styles/Login/login.css";
import { register } from "../api/Auth/auth";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const accessToken: any = localStorage.getItem("accessToken");

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const registerPayload = {
        userName: values.username,
        email: values.email,
        password: values.password,
        role: values.role === "customer" ? 2 : 3,
      };

      const response = await register(registerPayload, accessToken);
      message.success(response.data.message);
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Registration Failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="login-layout">
      <Content className="flex items-center justify-center p-4">
        <Card className="login-card">
          <div className="login-title">
            <Title level={2}>E-Commerce Platform</Title>
            <Divider />
            <Title level={4} className="login-subtitle">
              Create Account
            </Title>
          </div>

          <Form
            name="register"
            initialValues={{ role: "customer" }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
                {
                  min: 3,
                  message: "Username must be at least 3 characters long!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  min: 6,
                  message: "Password must be at least 6 characters long!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select your role!" }]}
            >
              <Select placeholder="Select Role" prefix={<IdcardOutlined />}>
                <Option value="customer">Customer</Option>
                <Option value="seller">Seller</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="register-button"
                loading={loading}
                block
              >
                Register
              </Button>
            </Form.Item>

            <Divider plain>Already have an account?</Divider>
            <Button type="link" onClick={() => navigate("/")} block>
              Sign In
            </Button>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Register;
