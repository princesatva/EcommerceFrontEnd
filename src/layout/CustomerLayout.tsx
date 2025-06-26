import { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Space,
  Button,
  Badge,
  Avatar,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  UserOutlined,
  OrderedListOutlined,
  MessageOutlined,
  SearchOutlined,
  HomeOutlined,
  TagsOutlined,
  GiftOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import "../styles/Layout/CustomerLayout.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/Auth/auth";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const CustomerLayout = ({ children }: any) => {
  const [activeMenu, setActiveMenu] = useState("home");
  const navigate = useNavigate();

  const handleMenuClick = (key: any) => {
    setActiveMenu(key);

    switch (key) {
      case "home":
        navigate("/customer/home");
        break;
      case "cart":
        navigate("/customer/cart");
        break;
      case "orders":
        navigate("/customer/orders");
        break;
      case "sellers":
        navigate("/admin/sellers");
        break;
      case "invoices":
        navigate("/admin/invoices");
        break;
      case "vendors":
        navigate("/admin/vendors");
        break;
      case "bills":
        navigate("/admin/bills");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      default:
        navigate("/admin/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await logout(accessToken);

      if (response.status === 200) {
        message.success(response.message || "Logout successful");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("activeMenu");
        navigate("/");
      } else {
        message.error(response.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "cart",
      icon: <ShoppingCartOutlined />,
      label: "Cart",
    },
    {
      key: "orders",
      icon: <OrderedListOutlined />,
      label: "My Orders",
    },
    {
      key: "wishlist",
      icon: <HeartOutlined />,
      label: "Wishlist",
    },
    {
      key: "messages",
      icon: <MessageOutlined />,
      label: "Messages",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="customer-header">
        <div className="header-content">
          <div className="logo-section">
            <Title level={3} style={{ margin: 0, color: "white" }}>
              Ecommerce Shop
            </Title>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <input type="text" placeholder="Search for products..." />
              <Button type="primary" icon={<SearchOutlined />} />
            </div>
          </div>

          <div className="header-actions">
            <Space size="large">
              <Badge count={3} size="small">
                <BellOutlined className="header-icon" />
              </Badge>
              <Badge count={5} size="small">
                <ShoppingCartOutlined className="header-icon" />
              </Badge>
              <Avatar icon={<UserOutlined />} />
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ color: "white" }}
              >
                Logout
              </Button>
            </Space>
          </div>
        </div>
      </Header>

      <Layout>
        <Sider width={200} theme="light" className="customer-sider">
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            style={{ height: "100%", borderRight: 0 }}
            onClick={({ key }) => handleMenuClick(key)}
            items={menuItems}
          />
          <div className="promo-section">
            <div className="promo-card">
              <GiftOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
              <p>Special Offers</p>
              <Button type="primary" size="small">
                View Deals
              </Button>
            </div>
          </div>
        </Sider>

        <Content className="customer-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default CustomerLayout;
