import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Image,
  Table,
  Spin,
  Empty,
  message,
  Space,
  Divider,
  Tag,
  Badge,
} from "antd";
import {
  ShoppingOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getPendingOrderItemsByCustomerId } from "../api/Customer/customer";
import { getAllProducts } from "../api/Seller/seller";
import { getCustomerByEmail } from "../api/Auth/auth";

const { Title, Text } = Typography;

// Define interface for pending order items
interface PendingOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  productName?: string;
  productImage?: string;
  productCategory?: string;
}

// Define interface for product data
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number;
}

const PendingOrdersPage = () => {
  const [loading, setLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrderItem[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const accessToken: any = localStorage.getItem("accessToken");

  // Function to parse JWT token
  const parseJwt = (token: any) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  // Fetch customer ID when component mounts
  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
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

        // Fetch customer by email
        const response = await getCustomerByEmail(email, accessToken);

        if (
          response &&
          response.status === 200 &&
          response.data &&
          response.data.id
        ) {
          setCustomerId(response.data.id);
          console.log(`Customer ID set to: ${response.data.id}`);
        } else {
          console.error("Invalid customer data:", response);
          message.error("Customer information not found");
        }
      } catch (error) {
        console.error("Error fetching customer ID:", error);
        message.error("Failed to get customer information");
      }
    };

    fetchCustomerId();
  }, [accessToken]);

  // Fetch pending orders when customerId is available
  useEffect(() => {
    if (customerId) {
      fetchPendingOrders();
    }
  }, [customerId]);

  // Calculate total amount when pending orders change
  useEffect(() => {
    let total = 0;
    pendingOrders.forEach((item) => {
      total += item.totalPrice;
    });
    setTotalAmount(total);
  }, [pendingOrders]);

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      const response = await getPendingOrderItemsByCustomerId({
        customerId,
        accessToken,
      });

      // Check if the response has data property and it's an array
      if (response && Array.isArray(response.data)) {
        setPendingOrders(response.data);

        // Fetch product details for all pending orders
        await fetchProductDetails(response.data);
      } else {
        console.error("Invalid pending orders data:", response);
        setPendingOrders([]);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      message.error("Failed to load your pending orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch product details for pending orders
  const fetchProductDetails = async (items: any) => {
    if (!items.length) return;

    try {
      // Get unique product IDs from pending orders
      const productIds = [...new Set(items.map((item: any) => item.productId))];

      // Fetch all products in one call
      const response = await getAllProducts({
        pageSize: 100, // Use a large number to get all products
        accessToken,
      });

      if (response.status === 200 && response.data && response.data.items) {
        // Create a lookup map of products by ID
        const productsMap: any = {};
        response.data.items.forEach((product: any) => {
          productsMap[product.id] = product;
        });

        setProducts(productsMap);

        // Enrich pending orders with product details
        const enrichedOrders = items.map((item: any) => {
          const product = productsMap[item.productId];
          return {
            ...item,
            productName: product?.name || "Unknown Product",
            productImage: product?.imageUrl || "",
            productCategory: product?.category || "Uncategorized",
          };
        });

        setPendingOrders(enrichedOrders);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Group orders by orderId
  const groupedOrders = pendingOrders.reduce((acc: any, item: any) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = [];
    }
    acc[item.orderId].push(item);
    return acc;
  }, {});

  // Table columns
  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            width={80}
            height={80}
            src={
              record.productImage && record.productImage.startsWith("http")
                ? record.productImage
                : "/placeholder-product.png"
            }
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNioFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNioFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
            style={{ objectFit: "cover", marginRight: 10, paddingRight: 4 }}
            preview={false}
          />
          <div>
            <Text strong>{record.productName}</Text>
            <div>
              <Tag color="blue">{record.productCategory}</Tag>
              <Tag color="orange">{record.status}</Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: any) => <Text>${price.toFixed(2)}</Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: any) => (
        <Text strong type="danger">
          ${price.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: any) => (
        <Badge status="processing" text={`Order #${orderId}`} />
      ),
    },
  ];

  // Calculate order totals for each order
  const orderTotals: any = {};
  Object.keys(groupedOrders).forEach((orderId) => {
    orderTotals[orderId] = groupedOrders[orderId].reduce(
      (total: any, item: any) => total + item.totalPrice,
      0
    );
  });

  return (
    <div className="pending-orders-page">
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <ClockCircleOutlined style={{ fontSize: 24 }} />
              <Title level={4} style={{ margin: 0 }}>
                Your Pending Orders
              </Title>
            </Space>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchPendingOrders}>
              Refresh
            </Button>
          </Col>
        </Row>

        <Divider />

        <Spin spinning={loading}>
          {pendingOrders.length > 0 ? (
            <>
              {Object.keys(groupedOrders).map((orderId) => (
                <div key={orderId} style={{ marginBottom: 20 }}>
                  <Card
                    title={
                      <Space>
                        <Badge status="processing" />
                        <span>Order #{orderId}</span>
                      </Space>
                    }
                    type="inner"
                    extra={
                      <Text strong type="danger">
                        Total: ${orderTotals[orderId].toFixed(2)}
                      </Text>
                    }
                  >
                    <Table
                      dataSource={groupedOrders[orderId]}
                      columns={columns.filter(
                        (col) => col.dataIndex !== "orderId"
                      )}
                      rowKey="id"
                      pagination={false}
                    />
                  </Card>
                </div>
              ))}

              <Divider />

              <Row justify="end">
                <Col xs={24} sm={24} md={8} lg={6}>
                  <Card>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <Text strong>Total Pending Orders:</Text>
                      <Text strong>{Object.keys(groupedOrders).length}</Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <Text strong>Total Amount:</Text>
                      <Text strong style={{ fontSize: 18, color: "#f50" }}>
                        ${totalAmount.toFixed(2)}
                      </Text>
                    </div>
                    <Link to="/products">
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<ShoppingOutlined />}
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span>You have no pending orders</span>}
            >
              <Link to="/products">
                <Button type="primary" icon={<ShoppingOutlined />}>
                  Shop Now
                </Button>
              </Link>
            </Empty>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default PendingOrdersPage;
