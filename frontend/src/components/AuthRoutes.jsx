
import { Navigate, Outlet } from "react-router";
import useAuth from "src/hooks/useAuth";
function AuthRoutes() {
	const { isLoggedIn } = useAuth();
	if (isLoggedIn) {
		return <Outlet />
	}
	else {
		return <Navigate to="/" replace />;
	}
}

export default AuthRoutes;
