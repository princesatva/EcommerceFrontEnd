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
  InputNumber,
  Row,
  Col,
  Image,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  MoreOutlined,
  ShoppingOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DollarOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { deleteProduct, getAllProducts } from "../api/Seller/seller";
import ProductDrawer from "../components/Seller/ProductDrawer";

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");

  const [minPrice, setMinPrice] = useState(undefined);
  const [maxPrice, setMaxPrice] = useState(undefined);
  const [category, setCategory] = useState(undefined);
  const [sort, setSort] = useState<any>("asc");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer states
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const categories = ["Dummy"];

  const accessToken: any = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchProducts();
  }, [searchText, minPrice, maxPrice, category, sort, pageNumber, pageSize]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Call the API to get products
      const response = await getAllProducts({
        search: searchText,
        sort,
        minPrice,
        maxPrice,
        category,
        pageNumber,
        pageSize,
        accessToken,
      });

      if (response.status === 200) {
        setProducts(response.data.items);
        setTotalCount(response.totalCount);
      } else {
        message.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("An error occurred while fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: any) => {
    setSearchText(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleSortChange = (value: any) => {
    setSort(value);
    setPageNumber(1); // Reset to first page when sorting
  };

  const handleCategoryChange = (value: any) => {
    setCategory(value);
    setPageNumber(1); // Reset to first page when filtering by category
  };

  const handlePriceChange = (min: any, max: any) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPageNumber(1); // Reset to first page when filtering by price
  };

  const handleViewProduct = (productId: any) => {
    // Implement view product details
    console.log("Viewing product:", productId);
    message.info(`Viewing product details for ID: ${productId}`);
    // In a real app, you might navigate to a product details page
  };

  const handleEditProduct = (product: any) => {
    setProductToEdit(product);
    setDrawerVisible(true);
  };

  const handleAddProduct = () => {
    setProductToEdit(null);
    setDrawerVisible(true);
  };

  const handleDeleteProduct = (productId: any) => {
    Modal.confirm({
      title: "Delete Product",
      content: "Are you sure you want to delete this product?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Call the deleteProduct API
          await deleteProduct(productId, accessToken);

          message.success(`Product ${productId} deleted successfully`);
          fetchProducts(); // Refresh the product list
        } catch (error) {
          console.error("Error deleting product:", error);
          message.error("Failed to delete product");
        }
      },
    });
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setProductToEdit(null);
  };

  const handleDrawerSuccess = () => {
    fetchProducts();
  };

  const getDropdownItems = (record: any) => {
    return [
      {
        key: "1",
        label: "Edit",
        icon: <EditOutlined />,
        onClick: () => handleEditProduct(record),
      },
      {
        key: "2",
        label: "Delete",
        icon: <DeleteOutlined />,
        onClick: () => handleDeleteProduct(record.id),
        danger: true,
      },
    ];
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },

    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (imageUrl: any) => (
        <Image
          src={
            imageUrl && imageUrl.startsWith("http")
              ? imageUrl
              : "/placeholder-product.png"
          }
          alt="Product"
          width={60}
          height={60}
          fallback="data:image/png;base64,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"
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: any) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: any) => <span>${price ? price.toFixed(2) : "N/A"}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: any) => <Tag color="blue">{text || "Uncategorized"}</Tag>,
    },
    {
      title: "Stock",
      dataIndex: "quantity",
      key: "quantity",
      render: (stock: any) => {
        let color = "green";
        if (stock <= 0) {
          color = "red";
        } else if (stock < 10) {
          color = "orange";
        }
        return <Tag color={color}>{stock}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: any) => {
        const color = isActive ? "green" : "red";
        return <Tag color={color}>{isActive ? "Active" : "Inactive"}</Tag>;
      },
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

  const resetFilters = () => {
    setSearchText("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCategory(undefined);
    setSort("asc");
    setPageNumber(1);
  };

  return (
    <div className="products-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Title level={4}>
            <ShoppingOutlined /> Product Management
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
            >
              Add New Product
            </Button>
          </Space>
        </div>

        {/* Filter Section */}
        <Card size="small" style={{ marginBottom: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={6} lg={6} xl={6}>
              <Input
                placeholder="Search products"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={5} lg={5} xl={5}>
              <Select
                placeholder="Category"
                style={{ width: "100%" }}
                allowClear
                value={category}
                onChange={handleCategoryChange}
              >
                {categories.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={7} lg={7} xl={7}>
              <Row gutter={8}>
                <Col span={12}>
                  <InputNumber
                    placeholder="Min $"
                    style={{ width: "100%" }}
                    min={0}
                    value={minPrice}
                    onChange={(value) =>
                      handlePriceChange(value || undefined, maxPrice)
                    }
                    prefix={<DollarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <InputNumber
                    placeholder="Max $"
                    style={{ width: "100%" }}
                    min={0}
                    value={maxPrice}
                    onChange={(value) =>
                      handlePriceChange(minPrice, value || undefined)
                    }
                    prefix={<DollarOutlined />}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={12} md={3} lg={3} xl={3}>
              <Select
                placeholder="Sort"
                style={{ width: "100%" }}
                value={sort}
                onChange={handleSortChange}
              >
                <Option value="asc">
                  <Space>
                    <SortAscendingOutlined /> Price: Low to High
                  </Space>
                </Option>
                <Option value="desc">
                  <Space>
                    <SortDescendingOutlined /> Price: High to Low
                  </Space>
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={3} lg={3} xl={3}>
              <Button
                type="default"
                onClick={resetFilters}
                style={{ width: "100%" }}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card>

        <Table
          loading={loading}
          columns={columns}
          dataSource={products}
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
            showTotal: (total) => `Total ${total} products`,
          }}
        />
      </Card>

      {/* Product Drawer for Add/Edit */}
      <ProductDrawer
        visible={drawerVisible}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        productToEdit={productToEdit}
        categories={categories}
      />
    </div>
  );
};

export default Products;
