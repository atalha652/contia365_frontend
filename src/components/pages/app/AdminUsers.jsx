import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Badge, Select } from "../../ui";
import {
  ADMIN_PAGE_SIZE,
  canViewAdminUsers,
  listAdminUsers,
} from "../../../api/apiFunction/adminUserServices";
import AdminPagination from "./AdminPagination";

const COUNTRY_LABEL = { ES: "Spain", IT: "Italy" };
const TYPE_LABEL = { person: "Person", business: "Business", advisor: "Advisor" };

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-GB");
};

const AdminUsers = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const allowed = canViewAdminUsers(user);
  const [country, setCountry] = useState("");
  const [userType, setUserType] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(allowed);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await listAdminUsers({
          country: country || undefined,
          user_type: userType || undefined,
          page,
          page_size: ADMIN_PAGE_SIZE,
        });
        if (!cancelled) {
          setRows(data.users);
          setTotal(data.total);
          setTotalPages(data.total_pages);
          if (data.total_pages > 0 && page > data.total_pages) {
            setPage(data.total_pages);
          }
        }
      } catch (err) {
        const detail = err?.response?.data?.detail;
        if (!cancelled) {
          setError(
            typeof detail === "string" ? detail : "Could not load users."
          );
          setRows([]);
          setTotal(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [allowed, country, userType, page]);

  if (!allowed) {
    return (
      <div className="flex-1 bg-bg-70 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-fg-40">Users</h1>
          <p className="text-sm text-fg-60 mt-2">
            Only admin accounts can list Contia users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-70 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 min-h-full flex flex-col">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg-40">Users</h1>
            <p className="text-sm text-fg-60 mt-1">
              All Contia accounts. Filter by country and user type.
            </p>
          </div>
          <p className="text-xs text-fg-60">{total} user{total === 1 ? "" : "s"}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="w-44">
            <label className="block text-xs font-medium text-fg-60 mb-1.5">Country</label>
            <Select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All countries</option>
              <option value="ES">Spain</option>
              <option value="IT">Italy</option>
              <option value="unset">Not selected</option>
            </Select>
          </div>
          <div className="w-44">
            <label className="block text-xs font-medium text-fg-60 mb-1.5">User type</label>
            <Select
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All types</option>
              <option value="person">Person</option>
              <option value="business">Business</option>
              <option value="advisor">Advisor</option>
              <option value="unset">Not selected</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-bg-50 border border-bd-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-8 text-sm text-red-500">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-8 text-sm text-fg-60 text-center">
            No users match these filters.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id || row.email}
                className="bg-bg-50 border border-bd-50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-bg-60 border border-bd-50 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-fg-50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg-40 truncate">
                        {row.name || row.email || "Unknown"}
                      </p>
                      <p className="text-xs text-fg-60 truncate">{row.email || "—"}</p>
                      <p className="text-xs text-fg-60 mt-1">
                        {row.company_name ? `${row.company_name} · ` : ""}
                        {row.phone || "—"} · {formatWhen(row.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
                    <Badge variant={row.country === "IT" ? "warning" : row.country === "ES" ? "info" : "secondary"}>
                      {COUNTRY_LABEL[row.country] || row.country || "No country"}
                    </Badge>
                    <Badge variant="secondary">
                      {TYPE_LABEL[row.user_type] || row.user_type || "No type"}
                    </Badge>
                    {row.role === "admin" && <Badge variant="success">Admin</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-auto">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={ADMIN_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
