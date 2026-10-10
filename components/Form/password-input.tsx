import type { ComponentProps } from "react";
import { useState } from "react";
import { TextInput } from "react-native-paper";

type Props = Omit<
	ComponentProps<typeof TextInput>,
	"secureTextEntry" | "right"
> & {
	visibilityLabel: string;
};

export function PasswordInput({ visibilityLabel, ...props }: Props) {
	const [visible, setVisible] = useState(false);
	return (
		<TextInput
			{...props}
			secureTextEntry={!visible}
			right={
				<TextInput.Icon
					icon={visible ? "eye-off-outline" : "eye-outline"}
					accessibilityLabel={`${visible ? "Hide" : "Show"} ${visibilityLabel}`}
					onPress={() => setVisible((current) => !current)}
				/>
			}
		/>
	);
}
