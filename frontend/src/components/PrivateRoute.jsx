import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./Loader";

const PrivateRoute = () => {
  const { userData } = useSelector((state) => state.auth);

  // Redux pas encore hydraté
  if (userData === undefined) {
    return <Loader />;
  }

  // Pas connecté
  if (!userData) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
