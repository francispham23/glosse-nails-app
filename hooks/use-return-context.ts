import React from "react";
/**
 * Helper function to return the Context provided as an argument.
 * Used when namespacing context to return state and dispatch - Handles undefined checks so consumers don't need to.
 */
export function useReturnContext<T>(
	contextType: React.Context<T | undefined>,
): T {
	const context = React.useContext(contextType);
	if (context === undefined) {
		throw new Error(
			`useReturnContext must be used within a provider for this ${contextType.displayName || "context"}`,
		);
	}

	return context;
}
