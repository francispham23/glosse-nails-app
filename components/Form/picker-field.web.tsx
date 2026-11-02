import { type ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "react-aria-components";
import { useTheme } from "react-native-paper";

/** A read-only form value is a button on web, so touch and keyboard can open it. */
export function PickerField({
	label,
	value,
	open,
	setOpen,
	icon,
	mutedColor,
	children,
}: {
	label: string;
	value: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	icon: "calendar" | "clock";
	mutedColor: string;
	children: ReactNode;
}) {
	const { colors } = useTheme();
	const id = useId();
	const trigger = useRef<HTMLButtonElement>(null);
	const wasOpen = useRef(open);
	useEffect(() => {
		if (wasOpen.current && !open)
			trigger.current?.focus({ preventScroll: true });
		wasOpen.current = open;
	}, [open]);
	return (
		<div>
			<Button
				ref={trigger}
				aria-label={label}
				aria-expanded={open}
				aria-controls={open ? id : undefined}
				onPress={() => setOpen(!open)}
				style={{
					width: "100%",
					minHeight: 64,
					borderRadius: 24,
					border: `1px solid ${colors.outline}`,
					background: colors.surface,
					color: colors.onSurface,
					display: "flex",
					alignItems: "center",
					gap: 16,
					padding: "12px 16px",
					font: "inherit",
					fontSize: 16,
					textAlign: "left",
					cursor: "pointer",
				}}
			>
				<svg
					aria-hidden="true"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke={mutedColor}
					strokeWidth="2"
				>
					{icon === "clock" ? (
						<>
							<circle cx="12" cy="12" r="9" />
							<path d="M12 7v5l3 2" />
						</>
					) : (
						<>
							<rect x="3" y="5" width="18" height="16" rx="2" />
							<path d="M3 10h18M8 3v4M16 3v4" />
						</>
					)}
				</svg>
				{value}
			</Button>
			{open ? (
				<fieldset
					id={id}
					aria-label={`${label} controls`}
					style={{
						marginTop: 12,
						border: "none",
						padding: 0,
						minWidth: 0,
					}}
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							event.stopPropagation();
							setOpen(false);
						}
					}}
				>
					{children}
					<Button
						onPress={() => setOpen(false)}
						style={{
							marginTop: 12,
							minHeight: 44,
							padding: "8px 16px",
							color: colors.primary,
							border: `1px solid ${colors.outline}`,
							borderRadius: 12,
							background: colors.surface,
							font: "inherit",
							cursor: "pointer",
						}}
					>
						Done
					</Button>
				</fieldset>
			) : null}
		</div>
	);
}
