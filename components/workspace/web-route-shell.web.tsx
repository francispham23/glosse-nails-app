import { useRouter } from "expo-router";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FocusScope } from "react-aria";
import {
	Pressable,
	StyleSheet,
	useWindowDimensions,
	View,
	type ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useWebRouteDismiss } from "@/contexts/web-route-dismiss-context";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";
import { tryDismissModalRoute } from "@/utils/modal-route-dismiss";
import {
	ModalInitialFocus,
	WEB_ROUTE_MODAL_PANEL_ID,
} from "./modal-initial-focus.web";

const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WebRouteShell({ children }: PropsWithChildren) {
	const router = useRouter();
	const { colors } = useTheme();
	const { isCompact } = useWorkspaceLayout();
	const { height: windowHeight } = useWindowDimensions();
	const { dismissDisabled, isDismissDisabled } = useWebRouteDismiss();
	const panelHeight = Math.round(windowHeight * 0.9);
	const [reducedMotion] = useState(prefersReducedMotion);
	const [presented, setPresented] = useState(false);
	const dismissing = useRef(false);

	const closeRoute = useCallback(() => {
		tryDismissModalRoute(
			isDismissDisabled(),
			() => router.canGoBack(),
			() => router.dismiss(),
		);
	}, [isDismissDisabled, router]);

	const dismiss = useCallback(() => {
		if (isDismissDisabled() || dismissing.current) return;
		if (!router.canGoBack()) return;
		dismissing.current = true;
		setPresented(false);
		window.setTimeout(() => {
			if (!dismissing.current) return;
			dismissing.current = false;
			closeRoute();
		}, reducedMotion ? 180 : 340);
	}, [closeRoute, isDismissDisabled, reducedMotion, router]);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setPresented(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		const node = document.getElementById(WEB_ROUTE_MODAL_PANEL_ID);
		if (!node) return;
		const onEnd = (event: TransitionEvent) => {
			if (event.target !== node || !dismissing.current) return;
			if (event.propertyName !== "transform" && event.propertyName !== "opacity") {
				return;
			}
			dismissing.current = false;
			closeRoute();
		};
		node.addEventListener("transitionend", onEnd);
		return () => node.removeEventListener("transitionend", onEnd);
	}, [closeRoute]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") dismiss();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [dismiss]);

	const motion: ViewStyle = {
		transitionProperty: "opacity, transform",
		transitionDuration: reducedMotion ? "160ms" : "300ms",
		transitionTimingFunction: SHEET_EASE,
	} as ViewStyle;
	const panelTransform: ViewStyle["transform"] = reducedMotion
		? undefined
		: [
				{
					translateY: presented ? 0 : isCompact ? panelHeight : 16,
				},
				{ scale: presented || isCompact ? 1 : 0.96 },
			];

	const panelStyle: ViewStyle = {
		width: "100%",
		maxWidth: isCompact ? 600 : 880,
		height: panelHeight,
		maxHeight: panelHeight,
		backgroundColor: colors.background,
		borderTopLeftRadius: isCompact ? 20 : 20,
		borderTopRightRadius: isCompact ? 20 : 20,
		borderBottomLeftRadius: isCompact ? 0 : 20,
		borderBottomRightRadius: isCompact ? 0 : 20,
		overflow: "hidden",
		zIndex: 1,
	};

	return (
		<View
			accessibilityViewIsModal
			style={{
				position: "fixed",
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				zIndex: 9999,
				justifyContent: isCompact ? "flex-end" : "center",
				alignItems: "center",
				padding: isCompact ? 0 : 24,
			}}
		>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Close dialog backdrop"
				disabled={dismissDisabled}
				tabIndex={-1}
				onPress={dismiss}
				style={[
					StyleSheet.absoluteFill,
					motion,
					{
						backgroundColor: "rgba(0,0,0,0.45)",
						opacity: presented ? 1 : 0,
					},
				]}
			/>
			<FocusScope contain restoreFocus>
				<View
					nativeID={WEB_ROUTE_MODAL_PANEL_ID}
					accessibilityViewIsModal
					role="dialog"
					aria-modal
					style={[
						panelStyle,
						motion,
						{
							opacity: presented ? 1 : 0,
							transform: panelTransform,
						},
					]}
				>
					<ModalInitialFocus />
					<View style={{ flex: 1, position: "relative", height: "100%" }}>
						{children}
					</View>
				</View>
			</FocusScope>
		</View>
	);
}
