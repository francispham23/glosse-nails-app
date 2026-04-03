import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

type Role = Doc<"staffRoles">["role"];
type AuthzErrorCode = "UNAUTHENTICATED" | "FORBIDDEN";
type AuthzErrorReason =
	| "missing_role"
	| "inactive_role"
	| "insufficient_role"
	| "self_or_role_denied"
	| "technician_scope";

type AuthorizedActor = {
	userId: Id<"users">;
	role: Role;
};

export type AuthzErrorData = {
	code: AuthzErrorCode;
	message: string;
	reason?: AuthzErrorReason;
	allowedRoles?: Role[];
};

function throwAuthzError(data: AuthzErrorData): never {
	throw new ConvexError(data);
}

async function requireAuth(ctx: QueryCtx) {
	const userId = await getAuthUserId(ctx);
	if (userId === null) {
		throwAuthzError({
			code: "UNAUTHENTICATED",
			message: "Please sign in to continue.",
		});
	}

	return userId;
}

async function requireStaffRole(ctx: QueryCtx, userId: Id<"users">) {
	const roleRecord = await getStaffRoleRecord(ctx, userId);
	if (!roleRecord) {
		throwAuthzError({
			code: "FORBIDDEN",
			message: "Your account does not have access yet.",
			reason: "missing_role",
		});
	}

	if (!roleRecord.isActive) {
		throwAuthzError({
			code: "FORBIDDEN",
			message: "Your account is inactive. Please contact an owner or manager.",
			reason: "inactive_role",
		});
	}

	return roleRecord;
}

export async function getStaffRoleRecord(ctx: QueryCtx, userId: Id<"users">) {
	return await ctx.db
		.query("staffRoles")
		.withIndex("by_userId", (q) => q.eq("userId", userId))
		.first();
}

export async function requireActor(ctx: QueryCtx): Promise<AuthorizedActor> {
	const userId = await requireAuth(ctx);
	const roleRecord = await requireStaffRole(ctx, userId);

	return {
		userId,
		role: roleRecord.role,
	};
}

export function hasAnyRole(role: Role, allowedRoles: readonly Role[]) {
	return allowedRoles.includes(role);
}

export async function requireAnyRole(
	ctx: QueryCtx,
	allowedRoles: readonly Role[],
) {
	const actor = await requireActor(ctx);
	if (!hasAnyRole(actor.role, allowedRoles)) {
		throwAuthzError({
			code: "FORBIDDEN",
			message: "You do not have permission to perform this action.",
			reason: "insufficient_role",
			allowedRoles: [...allowedRoles],
		});
	}

	return actor;
}

export async function requireSelfOrRole(
	ctx: QueryCtx,
	targetUserId: Id<"users">,
	allowedRoles: readonly Role[],
) {
	const actor = await requireActor(ctx);
	if (actor.userId === targetUserId) {
		return {
			...actor,
			isSelf: true,
		};
	}

	if (!hasAnyRole(actor.role, allowedRoles)) {
		throwAuthzError({
			code: "FORBIDDEN",
			message: "You do not have permission to access this user.",
			reason: "self_or_role_denied",
			allowedRoles: [...allowedRoles],
		});
	}

	return {
		...actor,
		isSelf: false,
	};
}
