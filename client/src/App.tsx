import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import { useSelector } from "react-redux";
import AppLayout from "./layout/AppLayout";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard";
import { RootState } from "./store/store";
import NotFound from "./pages/NotFound";

interface PrivateRouteProps {
  // Expect a JSX element as a component
  component: JSX.Element;
}

// Protected Route
const ProtectedRoute = ({ component }: PrivateRouteProps) => {
  // Check if the user is logged in
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  // Redirect if not logged in
  return isLoggedIn ? component : <Navigate to="/auth" />;
};

// router and routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />} errorElement={<NotFound />}>
      <Route index element={<ProtectedRoute component={<Dashboard />} />} />
      <Route path="auth" element={<Auth />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
