"use client";

import { useMemo, useState } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Pagination } from "@/components/portal/Pagination";

/* ============================================================
   USERS — Platform user management
   ============================================================ */

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  phone: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const roleBadgeMap: Record<string, "green" | "gold" | "blue" | "purple" | "gray"> = {
  admin: "purple",
  editor: "blue",
  business_owner: "gold",
  subscriber: "gray",
};

export function UsersClient({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = users;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.display_name?.toLowerCase().includes(q)
      );
    }
    if (roleFilter) items = items.filter((u) => u.role === roleFilter);
    if (statusFilter === "active") items = items.filter((u) => u.is_active);
    if (statusFilter === "inactive") items = items.filter((u) => !u.is_active);
    return items;
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeCount = users.filter((u) => u.is_active).length;
  const verifiedCount = users.filter((u) => u.email_verified).length;

  const columns = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        width: "30%",
        render: (item: UserRow) => (
          <div className="flex items-center gap-3">
            {item.avatar_url ? (
              <img src={item.avatar_url} alt={item.display_name || "User avatar"} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[11px] font-semibold text-[#6b7280]">
                {(item.display_name ?? item.email)[0].toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-[13px] font-semibold text-black">{item.display_name ?? "—"}</span>
              <span className="block text-[11px] text-[#6b7280]">{item.email}</span>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (item: UserRow) => (
          <StatusBadge variant={roleBadgeMap[item.role] ?? "gray"}>
            {item.role}
          </StatusBadge>
        ),
      },
      {
        key: "email_verified",
        header: "Verified",
        render: (item: UserRow) => (
          <StatusBadge variant={item.email_verified ? "green" : "gray"}>
            {item.email_verified ? "Yes" : "No"}
          </StatusBadge>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        render: (item: UserRow) => (
          <StatusBadge variant={item.is_active ? "green" : "red"}>
            {item.is_active ? "Active" : "Disabled"}
          </StatusBadge>
        ),
      },
      {
        key: "last_login_at",
        header: "Last Login",
        render: (item: UserRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {item.last_login_at
              ? new Date(item.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "Never"}
          </span>
        ),
      },
      {
        key: "created_at",
        header: "Joined",
        render: (item: UserRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PortalTopbar title="Users" />
      <div className="p-8 space-y-4">
        <StatGrid columns={3}>
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Active" value={activeCount} />
          <StatCard label="Verified" value={verifiedCount} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "role",
              label: "All Roles",
              value: roleFilter,
              options: [
                { value: "admin", label: "Admin" },
                { value: "editor", label: "Editor" },
                { value: "business_owner", label: "Business Owner" },
                { value: "subscriber", label: "Subscriber" },
              ],
            },
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "role") setRoleFilter(value);
            if (key === "status") setStatusFilter(value);
            setPage(1);
          }}
          searchPlaceholder="Search users..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <button
              onClick={() => console.log("Edit user:", item.id)}
              className="text-[#c1121f] text-xs font-semibold hover:underline"
            >
              Edit
            </button>
          )}
          emptyMessage="No users found."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
