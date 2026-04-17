import {
	getAuthSessionId,
	getAuthUserId,
	invalidateSessions,
	modifyAccountCredentials,
	retrieveAccount,
} from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { action, query } from "./_generated/server";
import { getStaffRoleRecord, hasAnyRole, requireActor } from "./authz";

export const viewer = query({
	args: {},
	handler: async (ctx) => {
		const { userId, role } = await requireActor(ctx);
		const user = await ctx.db.get(userId);
		return user ? { ...user, role } : null;
	},
});

export const viewerRole = query({
	args: {},
	handler: async (ctx) => {
		const { role } = await requireActor(ctx);
		return role;
	},
});

export const viewerAccess = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return {
				authenticated: false,
				role: null,
				isActive: false,
				isAuthorized: false,
				message: "Please sign in to continue.",
			};
		}

		const user = await ctx.db.get(userId);
		const roleRecord = await getStaffRoleRecord(ctx, userId);
		if (!roleRecord) {
			return {
				authenticated: true,
				role: null,
				isActive: false,
				isAuthorized: false,
				user,
				message: "Your account does not have access yet.",
			};
		}

		if (!roleRecord.isActive) {
			return {
				authenticated: true,
				role: roleRecord.role,
				isActive: false,
				isAuthorized: false,
				user,
				message:
					"Your account is inactive. Please contact an owner or manager.",
			};
		}

		const isAuthorized = hasAnyRole(roleRecord.role, ["owner", "manager"]);

		return {
			authenticated: true,
			role: roleRecord.role,
			isActive: roleRecord.isActive,
			isAuthorized,
			user,
			message: isAuthorized ? null : "Forbidden to manage this area.",
		};
	},
});

export const usersByDateRange = query({
	args: {
		startDate: v.number(),
		endDate: v.number(),
		report: v.optional(v.boolean()),
	},
	handler: async (ctx, { startDate, endDate, report }) => {
		const actor = report ? await requireActor(ctx) : null;
		const canViewAllReportUsers = actor
			? hasAnyRole(actor.role, ["owner", "manager"])
			: true;

		const technicians = await ctx.db
			.query("users")
			.filter((q) => q.eq(q.field("isAnonymous"), undefined))
			.collect();

		const visibleTechnicians =
			report && actor && !canViewAllReportUsers
				? technicians.filter((tech) => tech._id === actor.userId)
				: technicians;

		const datedTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_service_date", (q) =>
				q.gte("serviceDate", startDate).lte("serviceDate", endDate),
			)
			.collect();

		// Return all visible technicians with total tips and compensation
		const result = await Promise.all(
			visibleTechnicians.map(async (tech) => {
				const transactions = datedTransactions.filter(
					(t) => t.technician === tech._id,
				);

				const compensation = Number.parseFloat(
					transactions
						.reduce(
							(sum, t) => sum + (report ? t.compensation / 2 : t.compensation),
							0,
						)
						.toFixed(2),
				);
				let tip: number;
				if (report) {
					const finalTip = transactions.reduce((sum, t) => {
						const nonCashTip = t.tipMethods.includes("Card")
							? t.tip - (t.tipInCash || 0)
							: 0;
						return sum + nonCashTip;
					}, 0);
					tip = Number.parseFloat(finalTip.toFixed(2));
				} else {
					tip = Number.parseFloat(
						transactions.reduce((sum, t) => sum + (t.tip || 0), 0).toFixed(2),
					);
				}

				return {
					...tech,
					tip,
					compensation,
				};
			}),
		);
		if (report) {
			return result.filter((tech) => tech.compensation > 0);
		}
		return result.sort((a, b) => a.compensation - b.compensation);
	},
});

export const getUserById = query({
	args: { userId: v.optional(v.id("users")) },
	handler: async (ctx, { userId }) => {
		if (userId) return await ctx.db.get(userId);
	},
});

export const changePassword = action({
	args: {
		oldPassword: v.string(),
		newPassword: v.string(),
		email: v.string(),
	},
	handler: async (ctx, { oldPassword, newPassword, email }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError("You must be signed in to change password.");
		}

		if (!email) {
			throw new ConvexError("Could not find an email for this account.");
		}

		if (newPassword.length < 8) {
			throw new ConvexError("New password must be at least 8 characters.");
		}

		if (oldPassword === newPassword) {
			throw new ConvexError(
				"New password must be different from current password.",
			);
		}

		await retrieveAccount(ctx, {
			provider: "password",
			account: {
				id: email,
				secret: oldPassword,
			},
		});

		await modifyAccountCredentials(ctx, {
			provider: "password",
			account: {
				id: email,
				secret: newPassword,
			},
		});

		const sessionId = await getAuthSessionId(ctx);
		await invalidateSessions(ctx, {
			userId,
			except: sessionId ? [sessionId] : undefined,
		});

		return { success: true };
	},
});
