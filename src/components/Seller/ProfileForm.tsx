import React from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Checkbox,
  InputNumber,
  Card,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  GlobalOutlined,
  WalletOutlined,
} from "@ant-design/icons";

// import "../../styles/Login/login.css";

const { Title, Text } = Typography;

interface SellerProfileFormProps {
  onFinish: (values: any) => void;
  loading: boolean;
  userEmail: string;
  onCancel?: () => void;
}

const SellerProfileForm: React.FC<SellerProfileFormProps> = ({
  onFinish,
  loading,
  userEmail,
  onCancel,
}) => {
  return (
    <Card>
      <div>
        <Title level={2}>Complete Your Profile</Title>
        <Divider />
        {/* <Title level={4} className="login-subtitle">
          Seller Information
        </Title>
        <Text type="secondary">
          Complete your profile information (Approval required before access)
        </Text> */}
      </div>

      <Form
        name="sellerProfile"
        onFinish={onFinish}
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
              style={{ width: onCancel ? "100%" : "100%" }}
            >
              Complete Profile
            </Button>
            {onCancel && (
              <Button onClick={onCancel} style={{ width: "100%" }}>
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SellerProfileForm;
