import { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Space,
  Button,
  Badge,
  Avatar,
  Dropdown,
  message,
} from "antd";
import {
  ShopOutlined,
  UserOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  MessageOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import "../styles/Layout/SellerLayout.css";
import { logout } from "../api/Auth/auth";
import { useNavigate } from "react-router-dom";
import SellerProfileForm from "../components/Seller/ProfileForm";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const SellerLayout = ({ children }: any) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "seller@example.com";

  const handleMenuClick = (key: any) => {
    setActiveMenu(key);

    switch (key) {
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "productslist":
        navigate("/seller/products");
        break;
      case "customers":
        navigate("/admin/customers");
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

  const onProfileSubmit = async (values: any) => {
    setLoading(true);
    try {
      // API call to update profile would go here
      console.log("Profile update values:", values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Profile updated successfully!");
      setShowProfileForm(false);
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfileUpdate = () => {
    setShowProfileForm(false);
    message.info("Profile update canceled");
  };

  const handleUserMenuClick = (e: any) => {
    const key = e.key;
    if (key === "1") {
      setShowProfileForm(true);
    } else if (key === "2") {
      handleLogout();
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <BarChartOutlined />,
      label: "Dashboard",
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Products",
      children: [
        {
          key: "productslist",
          label: "Product List",
        },
      ],
    },
    {
      key: "orders",
      icon: <ShopOutlined />,
      label: "Orders",
    },
    // {
    //   key: "customers",
    //   icon: <TeamOutlined />,
    //   label: "Customers",
    // },
    // {
    //   key: "finances",
    //   icon: <DollarOutlined />,
    //   label: "Finances",
    // },
    // {
    //   key: "analytics",
    //   icon: <BarChartOutlined />,
    //   label: "Analytics",
    // },
    // {
    //   key: "settings",
    //   icon: <SettingOutlined />,
    //   label: "Settings",
    // },
  ];

  const dropdownMenu = {
    items: [
      {
        key: "1",
        label: "Profile",
        icon: <UserOutlined />,
      },

      {
        key: "2",
        label: "Logout",
        icon: <LogoutOutlined />,
      },
    ],
    onClick: handleUserMenuClick,
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="seller-sider"
      >
        <div className="seller-logo">
          {!collapsed ? (
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              Seller Central
            </Title>
          ) : (
            <ShopOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeMenu]}
          defaultOpenKeys={["products"]}
          style={{ borderRight: 0 }}
          onClick={({ key }) => handleMenuClick(key)}
          items={menuItems}
        />

        <div className="quick-action">
          {!collapsed && (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              block
              className="add-product-btn"
            >
              Add New Product
            </Button>
          )}
        </div>
      </Sider>

      <Layout>
        <Header className="seller-header">
          <div className="header-content">
            <div className="header-left">
              <Title level={4} style={{ margin: 0, color: "#262626" }}>
                {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
              </Title>
            </div>

            <div className="header-right">
              <Space size="large">
                <Badge count={4} size="small">
                  <BellOutlined className="header-icon" />
                </Badge>

                <Badge count={2} size="small">
                  <MessageOutlined className="header-icon" />
                </Badge>

                <Dropdown menu={dropdownMenu} placement="bottomRight">
                  <Space className="user-dropdown">
                    <Avatar icon={<UserOutlined />} />
                    {!collapsed && (
                      <span className="user-name">John Seller</span>
                    )}
                  </Space>
                </Dropdown>
              </Space>
            </div>
          </div>
        </Header>

        <Content className="seller-content">
          {showProfileForm ? (
            <SellerProfileForm
              onFinish={onProfileSubmit}
              loading={loading}
              userEmail={userEmail}
              onCancel={handleCancelProfileUpdate}
            />
          ) : (
            children
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SellerLayout;
