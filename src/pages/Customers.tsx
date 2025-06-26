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
  StopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { getCustomers } from "../api/Customer/customer";
import { approveUser } from "../api/User/users";

const { Title } = Typography;

const Customers = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [approvalFilter, setApprovalFilter] = useState(undefined);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock accessToken - in a real application, you would get this from your auth system
  const accessToken: any = localStorage.getItem("accessToken");

  // Fetch customers on component mount and when search, filter, or pagination changes
  useEffect(() => {
    fetchCustomers();
  }, [searchText, approvalFilter, pageNumber, pageSize]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Call the API to get customers
      const response = await getCustomers(
        searchText,
        pageNumber,
        pageSize,
        approvalFilter,
        accessToken
      );

      if (response.status === 200) {
        setCustomers(response.data.items);
        setTotalCount(response.totalCount);
      } else {
        message.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("An error occurred while fetching customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: any) => {
    setSearchText(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleApprovalFilterChange = (value: any) => {
    setApprovalFilter(value);
    setPageNumber(1); // Reset to first page when filtering
  };

  const handleApproveCustomer = async (customerId: any) => {
    Modal.confirm({
      title: "Approve Customer",
      content: "Are you sure you want to approve this customer?",
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      onOk: async () => {
        try {
          // Call the approveCustomer function with the customer ID
          await approveCustomer(customerId, accessToken);
          message.success("Customer approved successfully");
          fetchCustomers(); // Refresh the customer list
        } catch (error) {
          console.error("Error approving customer:", error);
          message.error("Failed to approve customer");
        }
      },
    });
  };

  // Using the approveUser function from the admin API
  const approveCustomer = async (customerId: any, accessToken: any) => {
    try {
      // Call the approveUser API with role = "customer"
      return await approveUser(customerId, "2", accessToken);
    } catch (error) {
      console.error("Error in approveCustomer:", error);
      throw error;
    }
  };

  const getDropdownItems = (record: any) => {
    const items = [
      {
        key: "1",
        label: "View Details",
        icon: <EditOutlined />,
        onClick: () => console.log("View details for:", record.id),
      },
    ];

    if (!record.isApproved) {
      items.push({
        key: "2",
        label: "Approve",
        icon: <CheckCircleOutlined />,
        onClick: () => handleApproveCustomer(record.userId),
      });
    }

    return items;
  };

  const columns = [
    {
      title: "Customer ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) =>
        `${record.firstName || ""} ${record.lastName || ""}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (isApproved: any) => {
        const color = isApproved ? "green" : "volcano";
        return (
          <Tag color={color}>{isApproved ? "Approved" : "Not Approved"}</Tag>
        );
      },
    },
    {
      title: "Registration Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: any) => new Date(date).toLocaleDateString(),
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
    <div className="customers-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Title level={4}>Customer Management</Title>
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
              placeholder="Search customers"
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
          dataSource={customers}
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
            showTotal: (total) => `Total ${total} customers`,
          }}
        />
      </Card>
    </div>
  );
};

export default Customers;
