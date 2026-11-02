import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { WebRouteDismissProvider } from "@/contexts/web-route-dismiss-context";
import { WebRouteShell } from "./web-route-shell";

export function ModalRouteLayout({ children }: PropsWithChildren) {
	return (
		<WebRouteDismissProvider>
			<WebRouteShell>
				<View style={{ flex: 1, height: "100%", position: "relative" }}>
					{children}
				</View>
			</WebRouteShell>
		</WebRouteDismissProvider>
	);
}
