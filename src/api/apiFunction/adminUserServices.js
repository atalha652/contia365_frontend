import { ADMIN_URL } from "../restEndpoint";
import { httpGet } from "../../utils/httpMethods";

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const canViewAdminUsers = (user = {}) =>
  String(user.role || "").toLowerCase() === "admin";

export const isAdminAppPath = (pathname = "") => {
  const path = String(pathname).toLowerCase();
  return (
    path === "/app/dashboard" ||
    path.startsWith("/app/dashboard/") ||
    path.startsWith("/app/users") ||
    path.startsWith("/app/waitlist")
  );
};

export const getAdminDashboard = async () => {
  const response = await httpGet({ url: `${ADMIN_URL}/dashboard` });
  return response?.data || {};
};

export const ADMIN_PAGE_SIZE = 10;

export const listAdminUsers = async ({
  country,
  user_type,
  page = 1,
  page_size = ADMIN_PAGE_SIZE,
} = {}) => {
  const params = { page, page_size };
  if (country) params.country = country;
  if (user_type) params.user_type = user_type;
  const response = await httpGet({ url: `${ADMIN_URL}/users`, params });
  const data = response?.data;
  const users = Array.isArray(data?.users) ? data.users : [];
  const total = Number(data?.total) || 0;
  const pageSize = Number(data?.page_size) || page_size;
  const totalPages = Number(data?.total_pages) || (total ? Math.ceil(total / pageSize) : 0);
  return {
    users,
    total,
    page: Number(data?.page) || page,
    page_size: pageSize,
    total_pages: totalPages,
    has_next: Boolean(data?.has_next),
    has_prev: Boolean(data?.has_prev),
  };
};
