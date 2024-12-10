import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import { useSelector } from "react-redux";
import AppLayout from "./layout/AppLayout";
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/Dashboard";
import { RootState } from "./store/store";
import NotFound from "./pages/NotFound";
import TextTemplates from "./pages/text-template/TextTemplates";
import Notes from "./pages/note/Notes";
import CreateTextTemplate from "./pages/text-template/CreateTextTemplate";
import UpdateTextTemplate from "./pages/text-template/UpdateTextTemplate";
import UseTextTemplate from "./pages/text-template/UseTextTemplate";

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
      <Route path="text-templates">
        <Route
          index
          element={<ProtectedRoute component={<TextTemplates />} />}
        />

        <Route
          path="create"
          element={<ProtectedRoute component={<CreateTextTemplate />} />}
        />
        <Route
          path="update/:id"
          element={<ProtectedRoute component={<UpdateTextTemplate />} />}
        />
        <Route
          path=":id"
          element={<ProtectedRoute component={<UseTextTemplate />} />}
        />
      </Route>
      <Route path="notes" element={<ProtectedRoute component={<Notes />} />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
