export function tryDismissModalRoute(
	dismissDisabled: boolean,
	canGoBack: () => boolean,
	back: () => void,
) {
	if (dismissDisabled) return;
	if (canGoBack()) back();
}
