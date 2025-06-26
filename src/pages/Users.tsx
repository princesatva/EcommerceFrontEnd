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
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  createUser,
  deactivateUser,
  getUsers,
  updateUser,
} from "../api/User/users";
import UserDrawerForm from "../components/User/UserFormDrawer";

const { Title } = Typography;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);

  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock accessToken - in a real application, you would get this from your auth system
  const accessToken: any = localStorage.getItem("accessToken");

  // Fetch users on component mount and when search, filter, or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [searchText, roleFilter, pageNumber, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Call the API to get users
      const response = await getUsers({
        search: searchText,
        roleId: roleFilter,
        pageNumber,
        pageSize,
        accessToken,
      });

      if (response.status === 200) {
        // Filter out users with roleId === 1 (admin)
        const filteredUsers = response.data.items.filter(
          (user: any) => user.roleId !== 1
        );
        setUsers(filteredUsers);
        setTotalCount(
          response.data.totalCount -
            (response.data.totalCount - filteredUsers.length)
        );
      } else {
        message.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleRoleFilterChange = (value: number | undefined) => {
    setRoleFilter(value);
    setPageNumber(1); // Reset to first page when filtering
  };

  const showAddModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setDrawerVisible(true);
  };

  const showEditModal = (user: any) => {
    setModalMode("edit");
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (modalMode === "add") {
        const userData = {
          userName: values.userName,
          email: values.email,
          password: values.password,
          role: values.roleId,
        };

        // Call the createUser API
        await createUser(userData, accessToken);
        message.success("User added successfully");
      } else {
        const updateData = {
          userName: values.userName,
          email: values.email,
          roleId: values.roleId,
          isActive: values.isActive,
        };

        await updateUser(selectedUser.id, updateData, accessToken);

        console.log("Updating user:", values);
        message.success("User updated successfully");
      }
      setDrawerVisible(false);
      fetchUsers();
    } catch (error) {
      console.error("Form submission failed:", error);
      message.error("Failed to save user");
    }
  };

  const confirmDelete = (userId: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Delete user logic
          // You would implement your API call here
          console.log("Deleting user:", userId);
          message.success("User deleted successfully");
          fetchUsers(); // Refresh the user list
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error("Failed to delete user");
        }
      },
    });
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      // Update user status logic
      // You would implement your API call here
      await deactivateUser(userId, accessToken);
      message.success("User deactivated successfully");

      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user status:", error);
      message.error("Failed to update user status");
    }
  };

  const getDropdownItems = (record: any): MenuProps["items"] => {
    return [
      {
        key: "1",
        label: "Edit",
        icon: <EditOutlined />,
        onClick: () => showEditModal(record),
      },
      // {
      //   key: "2",
      //   label: "Delete",
      //   icon: <DeleteOutlined />,
      //   danger: true,
      //   onClick: () => confirmDelete(record.id),
      // },
      {
        key: "2",
        label: record.isActive ? "Deactivate" : "Activate",
        icon: record.isActive ? <LockOutlined /> : <UnlockOutlined />,
        onClick: () => handleStatusChange(record.id, !record.isActive),
      },
    ];
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: any) => {
        let color = "blue";
        if (role.name === "seller") color = "green";
        else if (role.name === "customer") color = "purple";
        return <Tag color={color}>{role.name}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => {
        const color = isActive ? "green" : "volcano";
        return <Tag color={color}>{isActive ? "Active" : "Inactive"}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
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
    <div className="users-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Title level={4}>User Management</Title>
          <Space>
            <Select
              placeholder="Filter by role"
              allowClear
              style={{ width: "150px" }}
              onChange={handleRoleFilterChange}
              options={[
                { value: 2, label: "Customer" },
                { value: 3, label: "Seller" },
              ]}
            />
            <Input
              placeholder="Search users"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "250px" }}
              allowClear
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={showAddModal}
            >
              Add User
            </Button>
          </Space>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={users}
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
            showTotal: (total) => `Total ${total} users`,
          }}
          // scroll={{ y: 1000 }}
        />
      </Card>

      <UserDrawerForm
        visible={drawerVisible}
        mode={modalMode as "add" | "edit"}
        onClose={() => setDrawerVisible(false)}
        onSubmit={handleFormSubmit}
        initialValues={selectedUser}
      />
    </div>
  );
};

export default Users;
