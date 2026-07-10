import { Dashboard } from "@/components/pages/menu/Dashboard"
import Allrequest from "@/components/pages/menu/AllRequests"
import MyRequest from "@/components/pages/menu/MyRequests"
import {
  ApprovalReviewPage,
  CanvassReviewPage,
  CanvassSheetPage,
  CreateRequestPage,
  GeneratedPurchaseOrderPage,
  ProcurementDashboardPage,
  PurchaseOrderPage,
  ReceivingPage,
  RequestCompletedPage,
  RequestDetailPage,
} from "@/components/pages/menu/request-module/RequestModulePages"

import UserProvisioningPage from "@/components/pages/menu/UserProvisioning"
import RolesPermissionsPage from "@/components/pages/menu/RolesPermissions"
import SettingsPage from "@/components/pages/Settings"
import LoginPage from "@/components/pages/Login"

import { Navigate, Route, Routes } from "react-router-dom"
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
      {/* PUBLIC */}
      <Route path="/" element={<LoginPage />} />

      {/* DASHBOARD LAYOUT */}
      <Route element={<Dashboard />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/allrequest" element={<Navigate to="/requests/all" replace />} />
        <Route path="/myrequest" element={<Navigate to="/requests/my" replace />} />
        <Route path="/create-request" element={<Navigate to="/requests/new" replace />} />
        <Route path="/procurement" element={<Navigate to="/procurement/requests" replace />} />

        <Route path="/procurement/requests" element={<ProcurementDashboardPage />} />

        <Route path="/requests">
          <Route index element={<Navigate to="my" replace />} />
          <Route path="my" element={<MyRequest />} />
          <Route path="all" element={<Allrequest />} />
          <Route path="new" element={<CreateRequestPage />} />
          <Route path=":requestId" element={<RequestDetailPage />} />
          <Route path=":requestId/approval" element={<ApprovalReviewPage />} />
          <Route path=":requestId/purchase-order" element={<PurchaseOrderPage />} />
          <Route path=":requestId/purchase-order/view" element={<GeneratedPurchaseOrderPage />} />
          <Route path=":requestId/canvass" element={<CanvassSheetPage />} />
          <Route path=":requestId/canvass/review" element={<CanvassReviewPage />} />
          <Route path=":requestId/receiving" element={<ReceivingPage />} />
          <Route path=":requestId/completed" element={<RequestCompletedPage />} />
        </Route>


        {/* ================= PROTECTED ================= */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/user-provisioning"
            element={<UserProvisioningPage />}
          />
          <Route
            path="/roles-permissions"
            element={<RolesPermissionsPage />}
          />
        </Route>

        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}