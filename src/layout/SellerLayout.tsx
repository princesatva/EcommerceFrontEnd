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

  const handleDeleteProduct = async (productId: number) => {
    try {
      // Get confirmation from user before deletion
      Modal.confirm({
        title: "Delete Product",
        content:
          "Are you sure you want to delete this product? This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          // Show loading message
          const loadingMessage = message.loading("Deleting product...", 0);

          try {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
              message.error("Authentication error. Please login again.");
              navigate("/login");
              return;
            }

            const response = await deleteProduct(productId, accessToken);

            // Close the loading message
            loadingMessage();

            if (response && response.success) {
              message.success("Product deleted successfully");

              // If you're maintaining product state in the parent component
              // Update the state to remove the deleted product
              setProducts((prevProducts) =>
                prevProducts.filter((product) => product.id !== productId)
              );

              // Alternatively, if you're fetching products from an API
              // You could refresh the product list
              // fetchProducts();
            } else {
              message.error(response?.message || "Failed to delete product");
            }
          } catch (error: any) {
            // Close the loading message
            loadingMessage();

            console.error("Delete product error:", error);

            if (error.response?.status === 401) {
              message.error("Your session has expired. Please login again.");
              navigate("/login");
            } else if (error.response?.data?.message) {
              message.error(error.response.data.message);
            } else {
              message.error("Failed to delete product. Please try again.");
            }
          }
        },
        onCancel() {
          message.info("Delete operation cancelled");
        },
      });
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      message.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleMenuClick = (key: any) => {
    setActiveMenu(key);
    // Navigation logic can be added here

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
