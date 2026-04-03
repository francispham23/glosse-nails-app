import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuthorization() {
	const access = useQuery(api.users.viewerAccess);
	const role = access?.role ?? null;
	const isAuthorized = access?.isAuthorized ?? false;
	const authenticated = access?.authenticated ?? false;
	const isActive = access?.isActive ?? false;
	const message = access?.message ?? null;
	const user = access?.user ?? null;

	return {
		authenticated,
		isActive,
		message,
		role,
		isAuthorized,
		user,
	};
}
