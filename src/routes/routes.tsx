// import { createBrowserRouter } from "react-router-dom";
// //Login

// import Login from "../components/Login";

// // Import layouts

// // Import pages

// // Admin pages

// //Components
// import NotFound from "../components/NotFound";
// import AdminLayout from "../layout/AdminLayout";
// import CustomerLayout from "../layout/CustomerLayout";
// import SellerLayout from "../layout/SellerLayout";
// // Create router
// const router = createBrowserRouter([
//   {
//     path: "/",
//     // element: <MainLayout />,
//     // errorElement: <NotFoundPage />,
//     children: [
//       {
//         index: true,
//         element: <Login />,
//       },
//     ],
//   },
//   {
//     path: "/admin",
//     element: <AdminLayout />,
//     children: [

//     ]
//   },
//   {
//     path: "/customer",
//     element: <CustomerLayout />,
//   },
//   {
//     path: "/seller",
//     element: <SellerLayout />,
//   },
//   {
//     path: "*",
//     element: <NotFound />,
//   },
// ]);

// export default router;

import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Login from "../components/Login";
import NotFound from "../components/NotFound";
import AdminLayout from "../layout/AdminLayout";
import CustomerLayout from "../layout/CustomerLayout";
import SellerLayout from "../layout/SellerLayout";

// Import pages
import Users from "../pages/Users";
import Register from "../components/Register";
import Customers from "../pages/Customers";
import Sellers from "../pages/Seller";
import Products from "../pages/Products";
import SellerProfileForm from "../components/Seller/ProfileForm";
import CustomerProducts from "../pages/CustomerProducts";
import CartPage from "../pages/Cart";
import PendingOrdersPage from "../pages/PendingOrders";
// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }: any) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };

  // Check if the user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // In a real app, you would decode the JWT and check the role
  // This is simplified for the example
  return children ? children : <Outlet />;
};

// Layout wrapper for admin routes
const AdminRouteWrapper = () => {
  return (
    <ProtectedRoute requiredRole="1">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
};

// Layout wrapper for customer routes
const CustomerRouteWrapper = () => {
  return (
    <ProtectedRoute requiredRole="2">
      <CustomerLayout>
        <Outlet />
      </CustomerLayout>
    </ProtectedRoute>
  );
};

const SellerRouteWrapper = () => {
  return (
    <ProtectedRoute requiredRole="3">
      <SellerLayout>
        <Outlet />
      </SellerLayout>
    </ProtectedRoute>
  );
};

// Create router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin",
    element: <AdminRouteWrapper />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        // element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
      {
        path: "sellers",
        element: <Sellers />,
      },
    ],
  },
  {
    path: "/customer",
    element: <CustomerRouteWrapper />,
    children: [
      {
        index: true,
        element: <Navigate to="/customer" replace />,
      },
      {
        path: "home",
        element: <CustomerProducts />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "orders",
        element: <PendingOrdersPage />,
      },
      // Add customer-specific routes here
    ],
  },
  {
    path: "/seller",
    element: <SellerRouteWrapper />,
    children: [
      {
        index: true,
        element: <Navigate to="/seller" replace />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "profile",
        element: (
          <SellerProfileForm
            onFinish={function (values: any): void {
              throw new Error("Function not implemented.");
            }}
            loading={false}
            userEmail={""}
          />
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
