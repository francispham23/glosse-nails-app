import { Ionicons } from "@expo/vector-icons";
import { Button, useThemeColor } from "heroui-native";

type AddButtonProps = {
	isAdding?: boolean;
	setIsAdding?: (selecting: boolean) => void;
};

export const AddButton = ({ isAdding, setIsAdding }: AddButtonProps) => {
	const color = useThemeColor("background");
	return (
		<Button
			onPress={() => setIsAdding?.(!isAdding)}
			className="overflow-hidden rounded-full"
		>
			<Ionicons
				size={18}
				color={color}
				name={isAdding ? "checkmark-outline" : "add-outline"}
			/>
		</Button>
	);
};
