import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Text, useTheme } from "react-native-paper";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";

export default function PickDateRoute() {
	const router = useRouter();
	const { isLight } = useAppTheme();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const { date, setDate } = useAppDate();
	const [draft, setDraft] = useState(date);
	const { colors } = useTheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheet
				ref={bottomSheetRef}
				backgroundStyle={{ backgroundColor: colors.surface }}
				enableDynamicSizing
				index={0}
				enablePanDownToClose
				onChange={(index) => {
					if (index === -1) {
						router.dismiss();
					}
				}}
				backdropComponent={(props) => (
					<BottomSheetBackdrop
						{...props}
						disappearsOnIndex={-1}
						appearsOnIndex={0}
						pressBehavior="close"
						onPress={() => router.dismiss()}
					/>
				)}
			>
				<BottomSheetView style={{ padding: 24, gap: 16 }}>
					<Text
						accessibilityRole="header"
						style={{ fontSize: 22, fontWeight: "700" }}
					>
						Choose date
					</Text>
					<DateTimePicker
						value={draft}
						maximumDate={new Date()}
						mode="date"
						themeVariant={isLight ? "light" : "dark"}
						textColor={colors.onSurface}
						display="spinner"
						onValueChange={(_, selectedDate) => {
							if (selectedDate) {
								setDraft(selectedDate);
							}
						}}
					/>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
							gap: 12,
						}}
					>
						<Button
							onPress={() => router.dismiss()}
							contentStyle={{ minHeight: 48 }}
						>
							Cancel
						</Button>
						<Button
							mode="contained"
							onPress={() => {
								setDate(draft);
								router.dismiss();
							}}
							contentStyle={{ minHeight: 48 }}
						>
							Apply date
						</Button>
					</View>
				</BottomSheetView>
			</BottomSheet>
		</GestureHandlerRootView>
	);
}
