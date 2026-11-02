import { useEffect, useLayoutEffect, useState } from "react";

function visibleViewport() {
	if (typeof window === "undefined") return { height: 0, top: 0 };
	const viewport = window.visualViewport;
	return {
		height: viewport?.height || window.innerHeight,
		top: viewport?.offsetTop || 0,
	};
}

/** Keep a web modal inside the space above the keyboard, including Safari panning. */
export function useModalViewport(panelId: string) {
	const [viewport, setViewport] = useState(visibleViewport);
	useEffect(() => {
		let frame = 0;
		const update = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const next = visibleViewport();
				setViewport((previous) =>
					previous.height === next.height && previous.top === next.top
						? previous
						: next,
				);
			});
		};
		const visual = window.visualViewport;
		visual?.addEventListener("resize", update);
		visual?.addEventListener("scroll", update);
		window.addEventListener("resize", update);
		update();
		return () => {
			cancelAnimationFrame(frame);
			visual?.removeEventListener("resize", update);
			visual?.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, []);

	useLayoutEffect(() => {
		let frame = 0;
		const reveal = () => {
			const panel = document.getElementById(panelId);
			const field = document.activeElement;
			if (!panel || !(field instanceof HTMLElement) || !panel.contains(field))
				return;
			// Scroll only the form's scroll containers, avoiding a jump in the background page.
			let parent = field.parentElement;
			while (parent && panel.contains(parent)) {
				const overflow = getComputedStyle(parent).overflowY;
				if (
					(overflow === "auto" || overflow === "scroll") &&
					parent.scrollHeight > parent.clientHeight
				) {
					const bounds = parent.getBoundingClientRect();
					const target = field.getBoundingClientRect();
					const top = Math.max(bounds.top, viewport.top) + 12;
					const bottom =
						Math.min(bounds.bottom, viewport.top + viewport.height) - 12;
					if (target.bottom > bottom)
						parent.scrollTop += target.bottom - bottom;
					else if (target.top < top) parent.scrollTop -= top - target.top;
				}
				parent = parent.parentElement;
			}
		};
		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(reveal);
		};
		document.addEventListener("focusin", schedule);
		schedule();
		return () => {
			cancelAnimationFrame(frame);
			document.removeEventListener("focusin", schedule);
		};
	}, [panelId, viewport]);
	return viewport;
}
