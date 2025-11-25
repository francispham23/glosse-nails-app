import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
	Icon,
	Label,
	NativeTabs,
	VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import {
	type ColorValue,
	type ImageSourcePropType,
	Platform,
} from "react-native";

// TODO: In the future we can remove this type. Learn more: https://exponent-internal.slack.com/archives/C0447EFTS74/p1758042759724779?thread_ts=1758039375.241799&cid=C0447EFTS74
type VectorIconFamily = {
	getImageSource: (
		name: string,
		size: number,
		color: ColorValue,
	) => Promise<ImageSourcePropType>;
};

export default function TabLayout() {
	const tintColor = useThemeColor("foreground");
	const inactiveTintColor = useThemeColor("muted");

	const labelSelectedStyle =
		Platform.OS === "ios" ? { color: tintColor } : undefined;

	return (
		<NativeTabs
			badgeBackgroundColor={tintColor}
			badgeTextColor={Platform.OS === "ios" ? "white" : tintColor}
			iconColor={Platform.OS === "ios" ? tintColor : inactiveTintColor}
			tintColor={Platform.OS === "ios" ? tintColor : inactiveTintColor}
			labelVisibilityMode="labeled"
			indicatorColor={Platform.OS === "ios" ? tintColor : inactiveTintColor}
			disableTransparentOnScrollEdge={true} // Used to prevent transparent background on iOS 18 and older
		>
			<NativeTabs.Trigger name="earnings">
				{Platform.select({
					ios: <Icon sf="person.2" />,
					android: (
						<Icon
							src={
								<VectorIcon
									family={MaterialCommunityIcons as VectorIconFamily}
									name="account-multiple"
								/>
							}
							selectedColor={tintColor}
						/>
					),
				})}
				<Label selectedStyle={labelSelectedStyle}>Earnings</Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="transactions">
				{Platform.select({
					ios: <Icon sf="bookmark" selectedColor={tintColor} />,
					android: (
						<Icon
							src={
								<VectorIcon
									family={MaterialCommunityIcons as VectorIconFamily}
									name="bookmark"
								/>
							}
							selectedColor={tintColor}
						/>
					),
				})}
				<Label selectedStyle={labelSelectedStyle}>Transactions</Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
