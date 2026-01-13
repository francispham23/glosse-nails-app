import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";

export default function PickDateRoute() {
	const router = useRouter();
	const { isLight } = useAppTheme();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const { date, setDate } = useAppDate();

	const className = cn(!isLight && "bg-black");

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheet
				ref={bottomSheetRef}
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
				<BottomSheetView className={`items-center ${className}`}>
					<DateTimePicker
						value={date}
						maximumDate={new Date()}
						mode="date"
						display="spinner"
						onChange={(_, selectedDate) => {
							if (selectedDate) {
								setDate(selectedDate);
							}
						}}
					/>
				</BottomSheetView>
			</BottomSheet>
		</GestureHandlerRootView>
	);
}
