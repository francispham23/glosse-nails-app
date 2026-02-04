import { FAB } from "react-native-paper";

type AddButtonProps = {
	isAdding?: boolean;
	setIsAdding?: (selecting: boolean) => void;
};

export const AddButton = ({ isAdding, setIsAdding }: AddButtonProps) => {
	return (
		<FAB
			icon={isAdding ? "check" : "plus"}
			onPress={() => setIsAdding?.(!isAdding)}
		/>
	);
};
