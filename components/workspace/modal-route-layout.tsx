import type { PropsWithChildren } from "react";
import { WebRouteDismissProvider } from "@/contexts/web-route-dismiss-context";
import { WebRouteShell } from "./web-route-shell";

export function ModalRouteLayout({ children }: PropsWithChildren) {
	return (
		<WebRouteDismissProvider>
			<WebRouteShell>{children}</WebRouteShell>
		</WebRouteDismissProvider>
	);
}
