// import { useState, useEffect } from "react";
// import {
//   Card,
//   Button,
//   Input,
//   Space,
//   Tag,
//   Select,
//   Typography,
//   InputNumber,
//   Row,
//   Col,
//   Image,
//   Pagination,
//   Empty,
//   Spin,
//   message,
// } from "antd";
// import {
//   SearchOutlined,
//   ShoppingCartOutlined,
//   SortAscendingOutlined,
//   SortDescendingOutlined,
//   DollarOutlined,
//   FilterOutlined,
// } from "@ant-design/icons";
// import { getAllProducts, getProductCategories } from "../api/Seller/seller";
// import { getCustomerByEmail } from "../api/Auth/auth";
// import { addToCart } from "../api/Customer/customer";
// import { log } from "console";

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { Meta } = Card;

// const CustomerProducts = () => {
//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [searchText, setSearchText] = useState("");
//   const [customerId, setCustomerId] = useState(null);

//   const [minPrice, setMinPrice] = useState(undefined);
//   const [maxPrice, setMaxPrice] = useState(undefined);
//   const [category, setCategory] = useState(undefined);
//   const [sort, setSort] = useState<any>("asc");

//   const [pageNumber, setPageNumber] = useState(1);
//   const [pageSize, setPageSize] = useState(12);

//   // Categories state instead of hardcoded array
//   const [categories, setCategories] = useState([]);

//   const accessToken: any = localStorage.getItem("accessToken");

//   useEffect(() => {
//     fetchProducts();
//     fetchCustomerId();
//   }, [searchText, minPrice, maxPrice, category, sort, pageNumber, pageSize]);

//   // Function to parse JWT token
//   const parseJwt = (token: any) => {
//     try {
//       return JSON.parse(atob(token.split(".")[1]));
//     } catch (e) {
//       return null;
//     }
//   };

//   const fetchCustomerId = async () => {
//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       if (!accessToken) {
//         message.error("Not authenticated");
//         return;
//       }

//       // Decode JWT token to get email
//       const payload = parseJwt(accessToken);
//       const email =
//         payload[
//           "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
//         ];

//       if (!email) {
//         message.error("Email not found in token");
//         return;
//       }

//       // Fetch customer by email
//       const response = await getCustomerByEmail(email, accessToken);
//       console.log("Customer response:", response);

//       // Check for data property in the response and ensure we're getting the correct ID
//       if (
//         response &&
//         response.status === 200 &&
//         response.data &&
//         response.data.id
//       ) {
//         // Make sure to use the ID from the response data
//         setCustomerId(response.data.id);
//         console.log(`Customer ID set to: ${response.data.id}`);
//       } else {
//         console.error("Invalid customer data:", response);
//         message.error("Customer information not found");
//       }
//     } catch (error) {
//       console.error("Error fetching customer ID:", error);
//       message.error("Failed to get customer information");
//     }
//   };

//   // New effect to fetch categories when component mounts
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await getProductCategories(accessToken);
//         // Access the data property from the response
//         if (response && response.data && Array.isArray(response.data)) {
//           setCategories(response.data);
//         } else {
//           console.error("Invalid categories data structure:", response);
//           setCategories([]); // Fallback to empty array
//         }
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//         setCategories([]); // Fallback to empty array if fetch fails
//       }
//     };

//     fetchCategories();
//   }, [accessToken]);

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await getAllProducts({
//         search: searchText,
//         sort,
//         minPrice,
//         maxPrice,
//         category,
//         pageNumber,
//         pageSize,
//         accessToken,
//       });

//       if (response.status === 200) {
//         setProducts(response.data.items);
//         setTotalCount(response.totalCount);
//       } else {
//         console.error("Failed to fetch products");
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (value: any) => {
//     setSearchText(value);
//     setPageNumber(1); // Reset to first page when searching
//   };

//   const handleSortChange = (value: any) => {
//     setSort(value);
//     setPageNumber(1); // Reset to first page when sorting
//   };

//   const handleCategoryChange = (value: any) => {
//     setCategory(value);
//     setPageNumber(1); // Reset to first page when filtering by category
//   };

//   const handlePriceChange = (min: any, max: any) => {
//     setMinPrice(min);
//     setMaxPrice(max);
//     setPageNumber(1); // Reset to first page when filtering by price
//   };

//   const handleAddToCart = async (product: any) => {
//     try {
//       if (!customerId) {
//         message.error("Customer ID not found. Please log in again.");
//         return;
//       }

//       setLoading(true);
//       const accessToken: any = localStorage.getItem("accessToken");

//       console.log("Adding to cart with customer ID:", customerId);

//       const response = await addToCart({
//         productId: product.id,
//         customerId: customerId, // This should now have the correct ID (1008)
//         quantity: 1,
//         accessToken,
//       });

//       if (response && response.status === 200) {
//         message.success(`${product.name} added to cart!`);
//       } else {
//         message.error(
//           `Failed to add item to cart: ${response?.message || "Unknown error"}`
//         );
//       }
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       message.error("An error occurred while adding to cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetFilters = () => {
//     setSearchText("");
//     setMinPrice(undefined);
//     setMaxPrice(undefined);
//     setCategory(undefined);
//     setSort("asc");
//     setPageNumber(1);
//   };

//   return (
//     <div className="customer-products-page">
//       <Card>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginBottom: "20px",
//           }}
//         >
//           <Title level={4}>Our Products</Title>
//         </div>

//         {/* Filter Section */}
//         <Card size="small" style={{ marginBottom: "20px" }}>
//           <Row gutter={[16, 16]}>
//             <Col xs={24} sm={24} md={6} lg={6} xl={6}>
//               <Input
//                 placeholder="Search products"
//                 prefix={<SearchOutlined />}
//                 value={searchText}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 allowClear
//               />
//             </Col>
//             <Col xs={24} sm={12} md={5} lg={5} xl={5}>
//               <Select
//                 placeholder="Category"
//                 style={{ width: "100%" }}
//                 allowClear
//                 value={category}
//                 onChange={handleCategoryChange}
//               >
//                 {categories.map((cat) => (
//                   <Option key={cat} value={cat}>
//                     {cat}
//                   </Option>
//                 ))}
//               </Select>
//             </Col>
//             <Col xs={24} sm={12} md={7} lg={7} xl={7}>
//               <Row gutter={8}>
//                 <Col span={12}>
//                   <InputNumber
//                     placeholder="Min $"
//                     style={{ width: "100%" }}
//                     min={0}
//                     value={minPrice}
//                     onChange={(value) =>
//                       handlePriceChange(value || undefined, maxPrice)
//                     }
//                     prefix={<DollarOutlined />}
//                   />
//                 </Col>
//                 <Col span={12}>
//                   <InputNumber
//                     placeholder="Max $"
//                     style={{ width: "100%" }}
//                     min={0}
//                     value={maxPrice}
//                     onChange={(value) =>
//                       handlePriceChange(minPrice, value || undefined)
//                     }
//                     prefix={<DollarOutlined />}
//                   />
//                 </Col>
//               </Row>
//             </Col>
//             <Col xs={24} sm={12} md={3} lg={3} xl={3}>
//               <Select
//                 placeholder="Sort"
//                 style={{ width: "100%" }}
//                 value={sort}
//                 onChange={handleSortChange}
//               >
//                 <Option value="asc">
//                   <Space>
//                     <SortAscendingOutlined /> Price: Low to High
//                   </Space>
//                 </Option>
//                 <Option value="desc">
//                   <Space>
//                     <SortDescendingOutlined /> Price: High to Low
//                   </Space>
//                 </Option>
//               </Select>
//             </Col>
//             <Col xs={24} sm={12} md={3} lg={3} xl={3}>
//               <Button
//                 type="default"
//                 onClick={resetFilters}
//                 style={{ width: "100%" }}
//                 icon={<FilterOutlined />}
//               >
//                 Reset
//               </Button>
//             </Col>
//           </Row>
//         </Card>

//         {/* Products Grid */}
//         <Spin spinning={loading}>
//           {products.length > 0 ? (
//             <>
//               <Row gutter={[16, 16]}>
//                 {products.map((product: any) => (
//                   <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
//                     <Card
//                       hoverable
//                       cover={
//                         <Image
//                           alt={product.name}
//                           src={
//                             product.imageUrl &&
//                             product.imageUrl.startsWith("http")
//                               ? product.imageUrl
//                               : "/placeholder-product.png"
//                           }
//                           fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNioFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
//                           style={{ height: 200, objectFit: "cover" }}
//                           preview={false}
//                         />
//                       }
//                       actions={[
//                         <Button
//                           type="primary"
//                           icon={<ShoppingCartOutlined />}
//                           onClick={() => handleAddToCart(product)}
//                         >
//                           Add to Cart
//                         </Button>,
//                       ]}
//                     >
//                       <Meta
//                         title={product.name || "Product Name"}
//                         description={
//                           <>
//                             <div style={{ marginBottom: 10 }}>
//                               <Text
//                                 strong
//                                 style={{ fontSize: 16, color: "#f50" }}
//                               >
//                                 $
//                                 {product.price
//                                   ? product.price.toFixed(2)
//                                   : "N/A"}
//                               </Text>
//                             </div>
//                             <div>
//                               <Tag color="blue">
//                                 {product.category || "Uncategorized"}
//                               </Tag>
//                               {product.quantity <= 0 ? (
//                                 <Tag color="red">Out of Stock</Tag>
//                               ) : product.quantity < 10 ? (
//                                 <Tag color="orange">
//                                   Low Stock: {product.quantity}
//                                 </Tag>
//                               ) : (
//                                 <Tag color="green">In Stock</Tag>
//                               )}
//                             </div>
//                           </>
//                         }
//                       />
//                     </Card>
//                   </Col>
//                 ))}
//               </Row>

//               {/* Pagination */}
//               <div style={{ textAlign: "center", marginTop: "20px" }}>
//                 <Pagination
//                   current={pageNumber}
//                   pageSize={pageSize}
//                   total={totalCount}
//                   onChange={(page, pageSize) => {
//                     setPageNumber(page);
//                     setPageSize(pageSize);
//                   }}
//                   showSizeChanger
//                   pageSizeOptions={["12", "24", "36", "48"]}
//                 />
//               </div>
//             </>
//           ) : (
//             <Empty
//               description={
//                 <span>
//                   No products found. Try adjusting your search or filters.
//                 </span>
//               }
//             />
//           )}
//         </Spin>
//       </Card>
//     </div>
//   );
// };

// export default CustomerProducts;

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Select,
  Typography,
  InputNumber,
  Row,
  Col,
  Image,
  Pagination,
  Empty,
  Spin,
  message,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DollarOutlined,
  FilterOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { getAllProducts, getProductCategories } from "../api/Seller/seller";
import { getCustomerByEmail } from "../api/Auth/auth";
import { addToCart } from "../api/Customer/customer";

const { Title, Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

const CustomerProducts = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [customerId, setCustomerId] = useState(null);

  // Store quantities for each product
  const [productQuantities, setProductQuantities] = useState<any>({});

  const [minPrice, setMinPrice] = useState(undefined);
  const [maxPrice, setMaxPrice] = useState(undefined);
  const [category, setCategory] = useState(undefined);
  const [sort, setSort] = useState<any>("asc");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Categories state instead of hardcoded array
  const [categories, setCategories] = useState([]);

  const accessToken: any = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchProducts();
    fetchCustomerId();
  }, [searchText, minPrice, maxPrice, category, sort, pageNumber, pageSize]);

  // Function to parse JWT token
  const parseJwt = (token: any) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const fetchCustomerId = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
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
      console.log("Customer response:", response);

      // Check for data property in the response and ensure we're getting the correct ID
      if (
        response &&
        response.status === 200 &&
        response.data &&
        response.data.id
      ) {
        // Make sure to use the ID from the response data
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

  // New effect to fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getProductCategories(accessToken);
        // Access the data property from the response
        if (response && response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error("Invalid categories data structure:", response);
          setCategories([]); // Fallback to empty array
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // Fallback to empty array if fetch fails
      }
    };

    fetchCategories();
  }, [accessToken]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
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

        // Initialize quantities for each product
        const initialQuantities: any = {};
        response.data.items.forEach((product: any) => {
          // Either keep existing quantity or initialize to 1
          initialQuantities[product.id] = productQuantities[product.id] || 1;
        });
        setProductQuantities(initialQuantities);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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

  // Increase quantity for a specific product
  const increaseQuantity = (productId: any, maxQuantity: any) => {
    setProductQuantities((prev: any) => {
      const currentQty = prev[productId] || 1;
      if (currentQty < maxQuantity) {
        return { ...prev, [productId]: currentQty + 1 };
      } else {
        message.warning("Cannot exceed available stock");
        return prev;
      }
    });
  };

  // Decrease quantity for a specific product
  const decreaseQuantity = (productId: any) => {
    setProductQuantities((prev: any) => {
      const currentQty = prev[productId] || 1;
      if (currentQty > 1) {
        return { ...prev, [productId]: currentQty - 1 };
      }
      return prev; // Don't go below 1
    });
  };

  const handleAddToCart = async (product: any) => {
    try {
      if (!customerId) {
        message.error("Customer ID not found. Please log in again.");
        return;
      }

      // Get the selected quantity for this product
      const selectedQuantity = productQuantities[product.id] || 1;

      // Check if requested quantity is available
      if (selectedQuantity > product.quantity) {
        message.error(`Only ${product.quantity} items available in stock`);
        return;
      }

      setLoading(true);
      const accessToken: any = localStorage.getItem("accessToken");

      console.log(
        `Adding ${selectedQuantity} of ${product.name} to cart with customer ID: ${customerId}`
      );

      const response = await addToCart({
        productId: product.id,
        customerId: customerId,
        quantity: selectedQuantity, // Use the selected quantity instead of hardcoded 1
        accessToken,
      });

      if (response && response.status === 200) {
        message.success(
          `${selectedQuantity} ${product.name}${
            selectedQuantity > 1 ? "s" : ""
          } added to cart!`
        );
      } else {
        message.error(
          `Failed to add item to cart: ${response?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("An error occurred while adding to cart");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCategory(undefined);
    setSort("asc");
    setPageNumber(1);
  };

  return (
    <div className="customer-products-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Title level={4}>Our Products</Title>
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
                icon={<FilterOutlined />}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Products Grid */}
        <Spin spinning={loading}>
          {products.length > 0 ? (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      cover={
                        <Image
                          alt={product.name}
                          src={
                            product.imageUrl &&
                            product.imageUrl.startsWith("http")
                              ? product.imageUrl
                              : "/placeholder-product.png"
                          }
                          fallback="data:image/png;base64,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"
                          style={{ height: 200, objectFit: "cover" }}
                          preview={false}
                        />
                      }
                      actions={[
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity <= 0}
                        >
                          Add to Cart
                        </Button>,
                      ]}
                    >
                      <Meta
                        title={product.name || "Product Name"}
                        description={
                          <>
                            <div style={{ marginBottom: 10 }}>
                              <Text
                                strong
                                style={{ fontSize: 16, color: "#f50" }}
                              >
                                $
                                {product.price
                                  ? product.price.toFixed(2)
                                  : "N/A"}
                              </Text>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                              <Tag color="blue">
                                {product.category || "Uncategorized"}
                              </Tag>
                              {product.quantity <= 0 ? (
                                <Tag color="red">Out of Stock</Tag>
                              ) : product.quantity < 10 ? (
                                <Tag color="orange">
                                  Low Stock: {product.quantity}
                                </Tag>
                              ) : (
                                <Tag color="green">In Stock</Tag>
                              )}
                            </div>

                            {/* Quantity counter */}
                            {product.quantity > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 8,
                                }}
                              >
                                <Text style={{ marginRight: 8 }}>
                                  Quantity:
                                </Text>
                                <Button
                                  icon={<MinusOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    decreaseQuantity(product.id);
                                  }}
                                  size="small"
                                  disabled={productQuantities[product.id] <= 1}
                                />
                                <span style={{ margin: "0 8px" }}>
                                  {productQuantities[product.id] || 1}
                                </span>
                                <Button
                                  icon={<PlusOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    increaseQuantity(
                                      product.id,
                                      product.quantity
                                    );
                                  }}
                                  size="small"
                                  disabled={
                                    productQuantities[product.id] >=
                                    product.quantity
                                  }
                                />
                              </div>
                            )}
                          </>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Pagination
                  current={pageNumber}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={(page, pageSize) => {
                    setPageNumber(page);
                    setPageSize(pageSize);
                  }}
                  showSizeChanger
                  pageSizeOptions={["12", "24", "36", "48"]}
                />
              </div>
            </>
          ) : (
            <Empty
              description={
                <span>
                  No products found. Try adjusting your search or filters.
                </span>
              }
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default CustomerProducts;
