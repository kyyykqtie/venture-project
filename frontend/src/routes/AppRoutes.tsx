import { Dashboard } from "@/components/pages/menu/Dashboard"
import Allrequest from "@/components/pages/menu/AllRequests"
import MyRequest from "@/components/pages/menu/MyRequests"
import CreateRequestPage from "@/components/pages/menu/CreateRequest"
import UserProvisioningPage from "@/components/pages/menu/UserProvisioning"
import RolesPermissionsPage from "@/components/pages/menu/RolesPermissions"
import SettingsPage from "@/components/pages/Settings"
import LoginPage from "@/components/pages/Login"
import { Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function DashboardHome() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">Dashboard</h1>
      <p className="text-lg text-gray-600">
        Choose a section from the sidebar to continue.
      </p>
    </div>
  )
}


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<Dashboard />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/allrequest" element={<Allrequest />} />
          <Route path="/myrequest" element={<MyRequest />} />
          <Route path="/create-request" element={<CreateRequestPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/user-provisioning" element={<UserProvisioningPage />} />
              <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
            </Route>  
          <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}