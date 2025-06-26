// import { useState, useEffect } from "react";
// import {
//   Card,
//   Button,
//   Typography,
//   Row,
//   Col,
//   Image,
//   InputNumber,
//   Table,
//   Spin,
//   Empty,
//   message,
//   Space,
//   Divider,
//   Tag,
//   Popconfirm,
// } from "antd";
// import {
//   ShoppingCartOutlined,
//   DeleteOutlined,
//   ShoppingOutlined,
//   ReloadOutlined,
//   CloseCircleOutlined,
// } from "@ant-design/icons";
// import { getCartItems, removeCartItem } from "../api/Customer/customer";
// import { getAllProducts } from "../api/Seller/seller";
// import { getCustomerByEmail } from "../api/Auth/auth";
// import { Link } from "react-router-dom";

// const { Title, Text } = Typography;

// // Define interface for cart items
// interface CartItem {
//   id: number;
//   productId: number;
//   customerId: number;
//   quantity: number;
//   productName?: string;
//   productPrice?: number;
//   productImage?: string;
//   productCategory?: string;
//   inStock?: number;
// }

// // Define interface for product data
// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   imageUrl: string;
//   category: string;
//   quantity: number;
// }

// const CartPage = () => {
//   const [loading, setLoading] = useState(false);
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [customerId, setCustomerId] = useState<number | null>(null);
//   const [products, setProducts] = useState<Record<number, Product>>({});
//   const [totalAmount, setTotalAmount] = useState<number>(0);

//   const accessToken: any = localStorage.getItem("accessToken");

//   // Function to parse JWT token
//   const parseJwt = (token: string) => {
//     try {
//       return JSON.parse(atob(token.split(".")[1]));
//     } catch (e) {
//       return null;
//     }
//   };

//   // Fetch customer ID when component mounts
//   useEffect(() => {
//     const fetchCustomerId = async () => {
//       try {
//         if (!accessToken) {
//           message.error("Not authenticated");
//           return;
//         }

//         // Decode JWT token to get email
//         const payload = parseJwt(accessToken);
//         const email =
//           payload[
//             "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
//           ];

//         if (!email) {
//           message.error("Email not found in token");
//           return;
//         }

//         // Fetch customer by email
//         const response = await getCustomerByEmail(email, accessToken);

//         if (
//           response &&
//           response.status === 200 &&
//           response.data &&
//           response.data.id
//         ) {
//           setCustomerId(response.data.id);
//           console.log(`Customer ID set to: ${response.data.id}`);
//         } else {
//           console.error("Invalid customer data:", response);
//           message.error("Customer information not found");
//         }
//       } catch (error) {
//         console.error("Error fetching customer ID:", error);
//         message.error("Failed to get customer information");
//       }
//     };

//     fetchCustomerId();
//   }, [accessToken]);

//   // Fetch cart items when customerId is available
//   useEffect(() => {
//     if (customerId) {
//       fetchCartItems();
//     }
//   }, [customerId]);

//   // Calculate total amount when cart items or products change
//   useEffect(() => {
//     let total = 0;
//     cartItems.forEach((item) => {
//       if (item.productPrice) {
//         total += item.productPrice * item.quantity;
//       }
//     });
//     setTotalAmount(total);
//   }, [cartItems]);

//   //   const fetchCartItems = async () => {
//   //     if (!customerId) return;

//   //     setLoading(true);
//   //     try {
//   //       const response = await getCartItems({
//   //         customerId,
//   //         accessToken,
//   //       });

//   //       if (response && Array.isArray(response)) {
//   //         setCartItems(response);

//   //         // Fetch product details for all cart items
//   //         await fetchProductDetails(response);
//   //       } else {
//   //         console.error("Invalid cart data:", response);
//   //         setCartItems([]);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching cart items:", error);
//   //       message.error("Failed to load your cart");
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   const fetchCartItems = async () => {
//     if (!customerId) return;

//     setLoading(true);
//     try {
//       const response = await getCartItems({
//         customerId,
//         accessToken,
//       });

//       // Check if the response has data property and it's an array
//       if (response && response.data && Array.isArray(response.data)) {
//         setCartItems(response.data);

//         // Fetch product details for all cart items
//         await fetchProductDetails(response.data);
//       } else {
//         console.error("Invalid cart data:", response);
//         setCartItems([]);
//       }
//     } catch (error) {
//       console.error("Error fetching cart items:", error);
//       message.error("Failed to load your cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProductDetails = async (items: CartItem[]) => {
//     if (!items.length) return;

//     try {
//       // Get unique product IDs from cart
//       const productIds = [...new Set(items.map((item) => item.productId))];

//       // Fetch all products in one call
//       const response = await getAllProducts({
//         pageSize: 100, // Use a large number to get all products
//         accessToken,
//       });

//       if (response.status === 200 && response.data && response.data.items) {
//         // Create a lookup map of products by ID
//         const productsMap: Record<number, Product> = {};
//         response.data.items.forEach((product: Product) => {
//           productsMap[product.id] = product;
//         });

//         setProducts(productsMap);

//         // Enrich cart items with product details
//         const enrichedCartItems = items.map((item) => {
//           const product = productsMap[item.productId];
//           return {
//             ...item,
//             productName: product?.name || "Unknown Product",
//             productPrice: product?.price || 0,
//             productImage: product?.imageUrl || "",
//             productCategory: product?.category || "Uncategorized",
//             inStock: product?.quantity || 0,
//           };
//         });

//         setCartItems(enrichedCartItems);
//       }
//     } catch (error) {
//       console.error("Error fetching product details:", error);
//     }
//   };

//   const handleQuantityChange = async (
//     cartItemId: number,
//     newQuantity: number | null
//   ) => {
//     if (!newQuantity || newQuantity < 1) return;

//     const item = cartItems.find((item) => item.id === cartItemId);
//     if (!item) return;

//     // Check if requested quantity is available in stock
//     if (item.inStock !== undefined && newQuantity > item.inStock) {
//       message.error(`Only ${item.inStock} items available in stock`);
//       return;
//     }

//     try {
//       setLoading(true);

//       // TODO: Replace with actual updateCartItem API call
//       // For now, we'll just update the local state
//       // const response = await updateCartItem({
//       //   cartItemId: cartItemId,
//       //   quantity: newQuantity,
//       //   accessToken,
//       // });

//       // Update local state
//       const updatedCartItems = cartItems.map((item) =>
//         item.id === cartItemId ? { ...item, quantity: newQuantity } : item
//       );

//       setCartItems(updatedCartItems);
//       message.success("Cart updated successfully");
//     } catch (error) {
//       console.error("Error updating cart:", error);
//       message.error("Failed to update cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Updated handleRemoveItem function
//   const handleRemoveItem = async (cartItemId: number) => {
//     try {
//       setLoading(true);

//       // Find the cart item to get its productId
//       const itemToRemove = cartItems.find((item) => item.id === cartItemId);

//       if (!itemToRemove || !customerId) {
//         message.error("Could not find item information");
//         return;
//       }

//       const response = await removeCartItem({
//         customerId,
//         productId: itemToRemove.productId, // Pass the product ID from the cart item
//         accessToken,
//       });

//       if (response && response.status === 200) {
//         // Remove item from local state
//         const updatedCartItems = cartItems.filter(
//           (item) => item.id !== cartItemId
//         );
//         setCartItems(updatedCartItems);
//         message.success("Item removed from cart");
//       } else {
//         console.error("Failed to remove item:", response);
//         message.error(response?.message || "Failed to remove item from cart");
//       }
//     } catch (error) {
//       console.error("Error removing item from cart:", error);
//       message.error("Failed to remove item from cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClearCart = async () => {
//     try {
//       setLoading(true);

//       // TODO: Replace with actual clearCart API call
//       // For now, we'll just update the local state
//       // const response = await clearCart({
//       //   customerId,
//       //   accessToken,
//       // });

//       // Clear cart in local state
//       setCartItems([]);
//       message.success("Cart cleared successfully");
//     } catch (error) {
//       console.error("Error clearing cart:", error);
//       message.error("Failed to clear cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckout = () => {
//     // Check if any items exceed available stock
//     const invalidItems = cartItems.filter(
//       (item) => item.inStock !== undefined && item.quantity > item.inStock
//     );

//     if (invalidItems.length > 0) {
//       message.error(
//         "Some items exceed available stock. Please update quantities."
//       );
//       return;
//     }

//     // TODO: Implement checkout logic
//     message.info("Proceeding to checkout...");
//     // Navigate to checkout page
//     // history.push("/checkout");
//   };

//   const columns = [
//     {
//       title: "Product",
//       dataIndex: "product",
//       key: "product",
//       render: (_: any, record: CartItem) => (
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <Image
//             width={80}
//             height={80}
//             src={
//               record.productImage && record.productImage.startsWith("http")
//                 ? record.productImage
//                 : "/placeholder-product.png"
//             }
//             fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNioFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNioFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
//             style={{ objectFit: "cover", marginRight: 10, paddingRight: 4 }}
//             preview={false}
//           />
//           <div>
//             <Text strong>{record.productName}</Text>
//             <div>
//               <Tag color="blue">{record.productCategory}</Tag>
//               {record.inStock === 0 ? (
//                 <Tag color="red">Out of Stock</Tag>
//               ) : record.inStock !== undefined &&
//                 record.quantity > record.inStock ? (
//                 <Tag color="red">
//                   Exceeds Stock ({record.inStock} available)
//                 </Tag>
//               ) : record.inStock !== undefined && record.inStock < 10 ? (
//                 <Tag color="orange">Low Stock: {record.inStock}</Tag>
//               ) : (
//                 <Tag color="green">In Stock</Tag>
//               )}
//             </div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Price",
//       dataIndex: "price",
//       key: "price",
//       render: (_: any, record: CartItem) => (
//         <Text strong>${record.productPrice?.toFixed(2) || "0.00"}</Text>
//       ),
//     },
//     {
//       title: "Quantity",
//       dataIndex: "quantity",
//       key: "quantity",

//       render: (_: any, record: CartItem) => (
//         <InputNumber
//           min={1}
//           max={record.inStock}
//           value={record.quantity}
//           onChange={(value) => handleQuantityChange(record.id, value)}
//           disabled={true}
//         />
//       ),
//     },
//     {
//       title: "Subtotal",
//       dataIndex: "subtotal",
//       key: "subtotal",
//       render: (_: any, record: CartItem) => (
//         <Text strong type="danger">
//           ${((record.productPrice || 0) * record.quantity).toFixed(2)}
//         </Text>
//       ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_: any, record: CartItem) => (
//         <Popconfirm
//           title="Remove this item?"
//           onConfirm={() => handleRemoveItem(record.id)}
//           okText="Yes"
//           cancelText="No"
//         >
//           <Button danger icon={<DeleteOutlined />} size="small">
//             Remove
//           </Button>
//         </Popconfirm>
//       ),
//     },
//   ];

//   return (
//     <div className="cart-page">
//       <Card>
//         <Row justify="space-between" align="middle">
//           <Col>
//             <Space align="center">
//               <ShoppingCartOutlined style={{ fontSize: 24 }} />
//               <Title level={4} style={{ margin: 0 }}>
//                 Your Shopping Cart
//               </Title>
//             </Space>
//           </Col>
//           <Col>
//             <Space>
//               <Button icon={<ReloadOutlined />} onClick={fetchCartItems}>
//                 Refresh
//               </Button>
//               {cartItems.length > 0 && (
//                 <Popconfirm
//                   title="Clear all items from your cart?"
//                   onConfirm={handleClearCart}
//                   okText="Yes"
//                   cancelText="No"
//                 >
//                   <Button danger icon={<CloseCircleOutlined />}>
//                     Clear Cart
//                   </Button>
//                 </Popconfirm>
//               )}
//             </Space>
//           </Col>
//         </Row>

//         <Divider />

//         <Spin spinning={loading}>
//           {cartItems.length > 0 ? (
//             <>
//               <Table
//                 dataSource={cartItems}
//                 columns={columns}
//                 rowKey="id"
//                 pagination={false}
//               />

//               <Divider />

//               <Row justify="end">
//                 <Col xs={24} sm={24} md={8} lg={6}>
//                   <Card>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         marginBottom: 8,
//                       }}
//                     >
//                       <Text>Subtotal:</Text>
//                       <Text strong>${totalAmount.toFixed(2)}</Text>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         marginBottom: 16,
//                       }}
//                     >
//                       <Text>Shipping:</Text>
//                       <Text>Calculated at checkout</Text>
//                     </div>
//                     <Divider style={{ margin: "12px 0" }} />
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         marginBottom: 16,
//                       }}
//                     >
//                       <Text strong>Total:</Text>
//                       <Text strong style={{ fontSize: 18, color: "#f50" }}>
//                         ${totalAmount.toFixed(2)}
//                       </Text>
//                     </div>
//                     <Button
//                       type="primary"
//                       size="large"
//                       block
//                       onClick={handleCheckout}
//                       icon={<ShoppingOutlined />}
//                       disabled={
//                         cartItems.length === 0 ||
//                         cartItems.some(
//                           (item) =>
//                             item.inStock !== undefined &&
//                             item.quantity > item.inStock
//                         )
//                       }
//                     >
//                       Proceed to Checkout
//                     </Button>
//                   </Card>
//                 </Col>
//               </Row>
//             </>
//           ) : (
//             <Empty
//               image={Empty.PRESENTED_IMAGE_SIMPLE}
//               description={<span>Your shopping cart is empty</span>}
//             >
//               <Link to="/products">
//                 <Button type="primary" icon={<ShoppingOutlined />}>
//                   Continue Shopping
//                 </Button>
//               </Link>
//             </Empty>
//           )}
//         </Spin>
//       </Card>
//     </div>
//   );
// };

// export default CartPage;

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Image,
  InputNumber,
  Table,
  Spin,
  Empty,
  message,
  Space,
  Divider,
  Tag,
  Popconfirm,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  getCartItems,
  placeOrder,
  removeCartItem,
} from "../api/Customer/customer";
import { getAllProducts } from "../api/Seller/seller";
import { getCustomerByEmail } from "../api/Auth/auth";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

// Define interface for cart items
interface CartItem {
  id: number;
  productId: number;
  customerId: number;
  quantity: number;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  productCategory?: string;
  inStock?: number;
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

const CartPage = () => {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const accessToken: any = localStorage.getItem("accessToken");

  // Function to parse JWT token
  const parseJwt = (token: string) => {
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

  // Fetch cart items when customerId is available
  useEffect(() => {
    if (customerId) {
      fetchCartItems();
    }
  }, [customerId]);

  // Calculate total amount when cart items or products change
  useEffect(() => {
    let total = 0;
    cartItems.forEach((item) => {
      if (item.productPrice) {
        total += item.productPrice * item.quantity;
      }
    });
    setTotalAmount(total);
  }, [cartItems]);

  const fetchCartItems = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      const response = await getCartItems({
        customerId,
        accessToken,
      });

      // Check if the response has data property and it's an array
      if (response && response.data && Array.isArray(response.data)) {
        setCartItems(response.data);

        // Fetch product details for all cart items
        await fetchProductDetails(response.data);
      } else {
        console.error("Invalid cart data:", response);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      message.error("Failed to load your cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (items: CartItem[]) => {
    if (!items.length) return;

    try {
      // Get unique product IDs from cart
      const productIds = [...new Set(items.map((item) => item.productId))];

      // Fetch all products in one call
      const response = await getAllProducts({
        pageSize: 100, // Use a large number to get all products
        accessToken,
      });

      if (response.status === 200 && response.data && response.data.items) {
        // Create a lookup map of products by ID
        const productsMap: Record<number, Product> = {};
        response.data.items.forEach((product: Product) => {
          productsMap[product.id] = product;
        });

        setProducts(productsMap);

        // Enrich cart items with product details
        const enrichedCartItems = items.map((item) => {
          const product = productsMap[item.productId];
          return {
            ...item,
            productName: product?.name || "Unknown Product",
            productPrice: product?.price || 0,
            productImage: product?.imageUrl || "",
            productCategory: product?.category || "Uncategorized",
            inStock: product?.quantity || 0,
          };
        });

        setCartItems(enrichedCartItems);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleQuantityChange = async (
    cartItemId: number,
    newQuantity: number | null
  ) => {
    if (!newQuantity || newQuantity < 1) return;

    const item = cartItems.find((item) => item.id === cartItemId);
    if (!item) return;

    // Check if requested quantity is available in stock
    if (item.inStock !== undefined && newQuantity > item.inStock) {
      message.error(`Only ${item.inStock} items available in stock`);
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual updateCartItem API call
      // For now, we'll just update the local state
      // const response = await updateCartItem({
      //   cartItemId: cartItemId,
      //   quantity: newQuantity,
      //   accessToken,
      // });

      // Update local state
      const updatedCartItems = cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedCartItems);
      message.success("Cart updated successfully");
    } catch (error) {
      console.error("Error updating cart:", error);
      message.error("Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  // Updated handleRemoveItem function
  const handleRemoveItem = async (cartItemId: number) => {
    try {
      setLoading(true);

      // Find the cart item to get its productId
      const itemToRemove = cartItems.find((item) => item.id === cartItemId);

      if (!itemToRemove || !customerId) {
        message.error("Could not find item information");
        return;
      }

      const response = await removeCartItem({
        customerId,
        productId: itemToRemove.productId, // Pass the product ID from the cart item
        accessToken,
      });

      if (response && response.status === 200) {
        // Remove item from local state
        const updatedCartItems = cartItems.filter(
          (item) => item.id !== cartItemId
        );
        setCartItems(updatedCartItems);
        message.success("Item removed from cart");
      } else {
        console.error("Failed to remove item:", response);
        message.error(response?.message || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      message.error("Failed to remove item from cart");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual clearCart API call
      // For now, we'll just update the local state
      // const response = await clearCart({
      //   customerId,
      //   accessToken,
      // });

      // Clear cart in local state
      setCartItems([]);
      message.success("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      message.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    // Check if any items exceed available stock
    const invalidItems = cartItems.filter(
      (item) => item.inStock !== undefined && item.quantity > item.inStock
    );

    if (invalidItems.length > 0) {
      message.error(
        "Some items exceed available stock. Please update quantities."
      );
      return;
    }

    if (!customerId) {
      message.error("Customer information not found");
      return;
    }

    try {
      setCheckoutLoading(true);

      // Call the placeOrder function
      const response = await placeOrder({
        customerId,
        accessToken,
      });

      if (response) {
        message.success("Order placed successfully!");
        // Clear the cart after successful order
        setCartItems([]);
        // You could redirect to an order confirmation page here
        // history.push(`/order-confirmation/${response.orderId}`);
      } else {
        message.error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      message.error("Failed to place order. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_: any, record: CartItem) => (
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
              {record.inStock === 0 ? (
                <Tag color="red">Out of Stock</Tag>
              ) : record.inStock !== undefined &&
                record.quantity > record.inStock ? (
                <Tag color="red">
                  Exceeds Stock ({record.inStock} available)
                </Tag>
              ) : record.inStock !== undefined && record.inStock < 10 ? (
                <Tag color="orange">Low Stock: {record.inStock}</Tag>
              ) : (
                <Tag color="green">In Stock</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: CartItem) => (
        <Text strong>${record.productPrice?.toFixed(2) || "0.00"}</Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",

      render: (_: any, record: CartItem) => (
        <InputNumber
          min={1}
          max={record.inStock}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          disabled={true}
        />
      ),
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (_: any, record: CartItem) => (
        <Text strong type="danger">
          ${((record.productPrice || 0) * record.quantity).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CartItem) => (
        <Popconfirm
          title="Remove this item?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="cart-page">
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <ShoppingCartOutlined style={{ fontSize: 24 }} />
              <Title level={4} style={{ margin: 0 }}>
                Your Shopping Cart
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchCartItems}>
                Refresh
              </Button>
              {cartItems.length > 0 && (
                <Popconfirm
                  title="Clear all items from your cart?"
                  onConfirm={handleClearCart}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<CloseCircleOutlined />}>
                    Clear Cart
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>

        <Divider />

        <Spin spinning={loading || checkoutLoading}>
          {cartItems.length > 0 ? (
            <>
              <Table
                dataSource={cartItems}
                columns={columns}
                rowKey="id"
                pagination={false}
              />

              <Divider />

              <Row justify="end">
                <Col xs={24} sm={24} md={8} lg={6}>
                  <Card>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text>Subtotal:</Text>
                      <Text strong>${totalAmount.toFixed(2)}</Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <Text>Shipping:</Text>
                      <Text>Calculated at checkout</Text>
                    </div>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <Text strong>Total:</Text>
                      <Text strong style={{ fontSize: 18, color: "#f50" }}>
                        ${totalAmount.toFixed(2)}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleCheckout}
                      icon={<ShoppingOutlined />}
                      loading={checkoutLoading}
                      disabled={
                        cartItems.length === 0 ||
                        cartItems.some(
                          (item) =>
                            item.inStock !== undefined &&
                            item.quantity > item.inStock
                        )
                      }
                    >
                      Proceed to Checkout
                    </Button>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span>Your shopping cart is empty</span>}
            >
              <Link to="/products">
                <Button type="primary" icon={<ShoppingOutlined />}>
                  Continue Shopping
                </Button>
              </Link>
            </Empty>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default CartPage;
