import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Modal,
  Select,
  Typography,
  message,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { getSellers } from "../api/Seller/seller";
import { approveUser } from "../api/User/users";

const { Title } = Typography;

const Sellers = () => {
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<boolean | undefined>(
    undefined
  );

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock accessToken - in a real application, you would get this from your auth system
  const accessToken: any = localStorage.getItem("accessToken");

  // Fetch sellers on component mount and when search, filter, or pagination changes
  useEffect(() => {
    fetchSellers();
  }, [searchText, approvalFilter, pageNumber, pageSize]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      // Call the API to get sellers
      const response = await getSellers({
        search: searchText,
        pageNumber,
        pageSize,
        isApproved: approvalFilter,
        accessToken,
      });

      if (response.status === 200) {
        setSellers(response.data.items);
        setTotalCount(response.totalCount);
      } else {
        message.error("Failed to fetch sellers");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      message.error("An error occurred while fetching sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleApprovalFilterChange = (value: boolean | undefined) => {
    setApprovalFilter(value);
    setPageNumber(1); // Reset to first page when filtering
  };

  // Using the approveUser function from the admin API for sellers
  const approveSeller = async (sellerId: number, accessToken?: string) => {
    try {
      // Call the approveUser API with role = "seller"
      return await approveUser(sellerId, "3", accessToken);
    } catch (error) {
      console.error("Error in approveSeller:", error);
      throw error;
    }
  };

  const handleApproveSeller = async (sellerId: number) => {
    Modal.confirm({
      title: "Approve Seller",
      content: "Are you sure you want to approve this seller?",
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      onOk: async () => {
        try {
          // Call the approveSeller function with the seller ID
          await approveSeller(sellerId, accessToken);
          message.success("Seller approved successfully");
          fetchSellers(); // Refresh the seller list
        } catch (error) {
          console.error("Error approving seller:", error);
          message.error("Failed to approve seller");
        }
      },
    });
  };

  const getDropdownItems = (record: any): MenuProps["items"] => {
    const items = [
      {
        key: "1",
        label: "View Details",
        icon: <EditOutlined />,
        onClick: () => console.log("View details for seller:", record.id),
      },
    ];

    if (!record.isApproved) {
      items.push({
        key: "2",
        label: "Approve",
        icon: <CheckCircleOutlined />,
        onClick: () => handleApproveSeller(record.userId),
      });
    }

    return items;
  };

  const columns = [
    {
      title: "Seller ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Business Name",
      dataIndex: "companyName",
      key: "businessName",
      render: (text: string) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Owner Name",
      dataIndex: "userName",
      key: "userName",
      render: (text: string) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
      render: (text: string) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Phone",
      dataIndex: "contactPhone",
      key: "contactPhone",
      render: (text: string) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (isApproved: boolean) => {
        const color = isApproved ? "green" : "volcano";
        return (
          <Tag color={color}>{isApproved ? "Approved" : "Not Approved"}</Tag>
        );
      },
    },
    {
      title: "Registration Date",
      dataIndex: "registeredAt",
      key: "registeredAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Dropdown
          menu={{ items: getDropdownItems(record) }}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="sellers-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Title level={4}>
            <ShopOutlined /> Seller Management
          </Title>
          <Space>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: "180px" }}
              onChange={handleApprovalFilterChange}
              options={[
                { value: true, label: "Approved" },
                { value: false, label: "Not Approved" },
              ]}
            />
            <Input
              placeholder="Search sellers"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "250px" }}
              allowClear
            />
          </Space>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={sellers}
          rowKey="id"
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalCount,
            onChange: (page, pageSize) => {
              setPageNumber(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} sellers`,
          }}
        />
      </Card>
    </div>
  );
};

export default Sellers;
