import { useEffect, useLayoutEffect } from "react";

export const WEB_ROUTE_MODAL_PANEL_ID = "web-route-modal-panel";

function focusPreferredControl(panel: HTMLElement) {
	const preferred =
		panel.querySelector<HTMLElement>('[aria-label="Close"]') ??
		panel.querySelector<HTMLElement>(
			'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
		);
	preferred?.focus();
}

function isInAriaHiddenTree(node: HTMLElement) {
	let current: HTMLElement | null = node;
	while (current) {
		if (current.getAttribute("aria-hidden") === "true") {
			return true;
		}
		current = current.parentElement;
	}
	return false;
}

/** Move focus off the hidden anchor screen so aria-hidden does not trap a focused control. */
export function ModalInitialFocus() {
	useLayoutEffect(() => {
		const panel = document.getElementById(WEB_ROUTE_MODAL_PANEL_ID);
		const active = document.activeElement;
		if (
			panel &&
			active instanceof HTMLElement &&
			!panel.contains(active) &&
			isInAriaHiddenTree(active)
		) {
			active.blur();
		}
	}, []);

	useEffect(() => {
		let cancelled = false;

		const focusPanel = () => {
			if (cancelled) return;
			const panel = document.getElementById(WEB_ROUTE_MODAL_PANEL_ID);
			if (!panel) return;

			const active = document.activeElement;
			if (active instanceof HTMLElement && !panel.contains(active)) {
				if (isInAriaHiddenTree(active)) {
					active.blur();
				}
			}

			const preferred =
				panel.querySelector<HTMLElement>('[aria-label="Close"]') ??
				panel.querySelector<HTMLElement>(
					'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
				);
			if (preferred) {
				preferred.focus();
				return;
			}
			requestAnimationFrame(focusPanel);
		};

		const onFocusIn = (event: FocusEvent) => {
			const panel = document.getElementById(WEB_ROUTE_MODAL_PANEL_ID);
			if (!panel) return;
			const target = event.target;
			if (!(target instanceof HTMLElement) || panel.contains(target)) {
				return;
			}
			if (!isInAriaHiddenTree(target)) return;
			target.blur();
			focusPreferredControl(panel);
		};

		document.addEventListener("focusin", onFocusIn, true);

		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(focusPanel);
		});
		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
			document.removeEventListener("focusin", onFocusIn, true);
		};
	}, []);

	return null;
}
