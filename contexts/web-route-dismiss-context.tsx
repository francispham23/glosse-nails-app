import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

type WebRouteDismissContextValue = {
	dismissDisabled: boolean;
	setDismissDisabled: (disabled: boolean) => void;
	isDismissDisabled: () => boolean;
};

const WebRouteDismissContext = createContext<WebRouteDismissContextValue>({
	dismissDisabled: false,
	setDismissDisabled: () => {},
	isDismissDisabled: () => false,
});

export function WebRouteDismissProvider({ children }: PropsWithChildren) {
	const [dismissDisabled, setDismissDisabledState] = useState(false);
	const dismissDisabledRef = useRef(false);
	const setDismissDisabled = useCallback((disabled: boolean) => {
		dismissDisabledRef.current = disabled;
		setDismissDisabledState(disabled);
	}, []);
	const isDismissDisabled = useCallback(() => dismissDisabledRef.current, []);
	const value = useMemo(
		() => ({ dismissDisabled, setDismissDisabled, isDismissDisabled }),
		[dismissDisabled, setDismissDisabled, isDismissDisabled],
	);
	return (
		<WebRouteDismissContext.Provider value={value}>
			{children}
		</WebRouteDismissContext.Provider>
	);
}

export function useWebRouteDismiss() {
	return useContext(WebRouteDismissContext);
}
