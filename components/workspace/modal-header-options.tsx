import type { Stack } from "expo-router";
import type { ComponentProps } from "react";
import { Platform, View } from "react-native";

type Options = Exclude<
	NonNullable<ComponentProps<typeof Stack>["screenOptions"]>,
	(...args: never[]) => unknown
>;

// Native bars add their own inset; web's header needs the full content gutter.
// Hide iOS's shared glass behind our already-themed circular controls.
export function modalHeaderOptions(options: Options): Options {
	const { headerLeft, headerRight } = options;
	const inset = Platform.OS === "web" ? 16 : 8;
	return {
		...options,
		...(headerLeft && {
			headerLeft: (props) => (
				<View style={{ marginHorizontal: inset }}>{headerLeft(props)}</View>
			),
			...(Platform.OS === "ios" && {
				unstable_headerLeftItems: (props) => [
					{
						type: "custom" as const,
						element: (
							<View style={{ marginHorizontal: inset }}>
								{headerLeft(props)}
							</View>
						),
						hidesSharedBackground: true,
					},
				],
			}),
		}),
		...(headerRight && {
			headerRight: (props) => (
				<View style={{ marginHorizontal: inset }}>{headerRight(props)}</View>
			),
			...(Platform.OS === "ios" && {
				unstable_headerRightItems: (props) => [
					{
						type: "custom" as const,
						element: (
							<View style={{ marginHorizontal: inset }}>
								{headerRight(props)}
							</View>
						),
						hidesSharedBackground: true,
					},
				],
			}),
		}),
	};
}
