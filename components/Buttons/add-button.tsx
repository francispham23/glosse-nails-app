import { Button, FAB } from "react-native-paper";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";

type AddButtonProps = {
	isAdding?: boolean;
	setIsAdding?: (selecting: boolean) => void;
	label?: string;
	onPress?: () => void;
	disabled?: boolean;
	loading?: boolean;
	desktopOnly?: boolean;
};

export const AddButton = ({
	isAdding,
	setIsAdding,
	label,
	onPress,
	disabled,
	loading,
	desktopOnly,
}: AddButtonProps) => {
	const { isCompact } = useWorkspaceLayout();
	if (desktopOnly && isCompact) return null;
	const handlePress = onPress ?? (() => setIsAdding?.(!isAdding));
	if (label)
		return (
			<Button
				mode="contained"
				compact={isCompact}
				accessibilityLabel={label}
				icon={isAdding ? "check" : "plus"}
				onPress={handlePress}
				disabled={disabled}
				loading={loading}
				contentStyle={{ minHeight: isCompact ? 48 : 44 }}
				style={{ borderRadius: 12 }}
			>
				{label}
			</Button>
		);
	return (
		<FAB
			icon={isAdding ? "check" : "plus"}
			onPress={handlePress}
			disabled={disabled}
		/>
	);
};
