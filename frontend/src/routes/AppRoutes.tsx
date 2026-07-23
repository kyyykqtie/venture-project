import { Dashboard, SuperAdminDashboardPage } from "@/components/pages/menu/Dashboard"
import Allrequest from "@/components/pages/menu/AllRequests"
import MyRequest from "@/components/pages/menu/MyRequests"
import {
  ApprovalReviewPage,
  CanvassReviewPage,
  CanvassSheetPage,
  CreateRequestPage,
  GeneratedPurchaseOrderPage,
  PurchaseOrderPage,
  ReceivingPage,
  RequestCompletedPage,
  RequestDetailPage,
} from "@/components/pages/menu/request-module/RequestModulePages"

import UserProvisioningPage from "@/components/pages/menu/UserProvisioning"
import RolesPermissionsPage from "@/components/pages/menu/UserManagement/RolesPermissions"
import UserDirectoryPage from "@/components/pages/menu/UserManagement/UserDirectory"
import SettingsPage from "@/components/pages/Settings"
import LoginPage from "@/components/pages/Login"

import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<LoginPage />} />

      {/* DASHBOARD LAYOUT */}
      <Route element={<Dashboard />}>
        <Route path="/dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="/allrequest" element={<Navigate to="/requests/all" replace />} />
        <Route path="/myrequest" element={<Navigate to="/requests/my" replace />} />
        <Route path="/create-request" element={<Navigate to="/requests/new" replace />} />
        <Route path="/procurement" element={<Navigate to="/procurement/requests" replace />} />



        <Route path="/requests">
          <Route index element={<Navigate to="my" replace />} />
          <Route path="my" element={<MyRequest />} />
          {/* All requests — requires view_all_records */}
          {/* Requests — any approver of either stage, or full visibility */}
          <Route element={<ProtectedRoute requiredPermission={["view_all_records", "approve_request_initial", "approve_request_final"]} />}>
            <Route path="all" element={<Allrequest />} />
          </Route>
          {/* Create request — requires create_request */}
          <Route element={<ProtectedRoute requiredPermission="create_request" />}>
            <Route path="new" element={<CreateRequestPage />} />
          </Route>
          <Route path=":requestId" element={<RequestDetailPage />} />
          <Route path=":requestId/approval" element={<ApprovalReviewPage />} />
          <Route path=":requestId/purchase-order" element={<PurchaseOrderPage />} />
          <Route path=":requestId/purchase-order/view" element={<GeneratedPurchaseOrderPage />} />
          <Route path=":requestId/canvass" element={<CanvassSheetPage />} />
          <Route path=":requestId/canvass/review" element={<CanvassReviewPage />} />
          <Route path=":requestId/receiving" element={<ReceivingPage />} />
          <Route path=":requestId/completed" element={<RequestCompletedPage />} />
        </Route>

        {/* ── Admin-only routes ───────────────────────────────────────────── */}
        {/* User provisioning — requires manage_users */}
        <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
          <Route path="/user-provisioning" element={<UserProvisioningPage />} />
          <Route path="/user-directory" element={<UserDirectoryPage />} />
        </Route>

        {/* Roles & permissions — requires manage_roles_permissions */}
        <Route element={<ProtectedRoute requiredPermission="manage_roles_permissions" />}>
          <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
        </Route>

        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
