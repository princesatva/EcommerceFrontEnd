import { useState } from "react";
import { Layout, Menu, Typography, Button, message } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MoneyCollectOutlined,
  ProductOutlined,
  FileDoneOutlined,
  AccountBookOutlined,
  AppstoreOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

import "../styles/Layout/AdminLayout.css";
import { logout } from "../api/Auth/auth";
import { useNavigate } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = ({ children }: any) => {
  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem("activeMenu") || "dashboard"
  );
  const navigate = useNavigate();

  const handleMenuClick = (key: any) => {
    setActiveMenu(key);

    localStorage.setItem("activeMenu", key);

    switch (key) {
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "users":
        navigate("/admin/users");
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
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "users",
      icon: <UsergroupAddOutlined />,
      label: "Users",
    },
    {
      key: "customers",
      icon: <AccountBookOutlined />,
      label: "Customers",
    },
    {
      key: "sellers",
      icon: <ProductOutlined />,
      label: "Sellers",
    },
    {
      key: "invoices",
      icon: <FileDoneOutlined />,
      label: "Invoices",
    },
    {
      key: "vendors",
      icon: <UserOutlined />,
      label: "Vendors",
    },
    {
      key: "bills",
      icon: <MoneyCollectOutlined />,
      label: "Bills",
    },
    {
      key: "settings",
      icon: <AppstoreOutlined />,
      label: "Settings",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        theme="light"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // background: "#4169e1",
            color: "white",
          }}
          className="sidebar-logo"
        >
          <Title level={4} style={{ margin: 0, color: "black" }}>
            Ecommerce
          </Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          style={{ height: "calc(100% - 64px)", borderRight: 0 }}
          onClick={({ key }) => handleMenuClick(key)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          className="site-layout-background ant-layout-header"
          style={{
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Title level={3} style={{ margin: 0, color: "white" }}>
              Ecommerce Platform
            </Title>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "white", fontSize: "16px" }}
            >
              Logout
            </Button>
          </div>
        </Header>

        <Content style={{ padding: 24, margin: 0, background: "#f8f9ff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
