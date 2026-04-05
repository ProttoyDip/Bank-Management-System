/**
 * Frontend permission checking utilities for Super Admin enforcement
 */

export function isSuperAdmin(accessLevel?: string): boolean {
  return accessLevel === "Super Admin";
}

export function isManagerAdmin(accessLevel?: string): boolean {
  return accessLevel === "Manager Admin";
}

export function canInviteEmployees(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

function parsePermissionList(permissions?: string | string[]): string[] {
  if (!permissions) {
    return [];
  }

  if (Array.isArray(permissions)) {
    return permissions.map((p) => String(p || "").trim()).filter(Boolean);
  }

  const raw = String(permissions || "").trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => String(p || "").trim()).filter(Boolean);
    }
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => String(key || "").trim())
        .filter(Boolean);
    }
  } catch {
    // fall back to comma-separated parsing
  }

  return raw.split(",").map((p) => p.trim()).filter(Boolean);
}

function hasPermission(permissions: string | string[] | undefined, permission: string): boolean {
  return parsePermissionList(permissions).includes(permission);
}

export function canManageEmployeeInvites(accessLevel?: string, permissions?: string | string[]): boolean {
  return isSuperAdmin(accessLevel) || hasPermission(permissions, "inviteEmployees");
}

export function canDeleteEmployeeInvites(accessLevel?: string, permissions?: string | string[]): boolean {
  return canManageEmployeeInvites(accessLevel, permissions);
}

export function canUpdateEmployeeStatus(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

export function canUpdateSettings(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

export function canCreateAdmin(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}
