import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";

type ReportType = "payroll" | "discount" | "cash" | "gift" | "supply";

export type Report = {
	id: ReportType;
	title: string;
	rows: Array<{
		label: string;
		value: string;
		isBold?: boolean;
		isLarge?: boolean;
	}>;
};

type Props = {
	item: Report;
	startDate: Date;
	endDate: Date;
};

export const ReportCard = ({ item, startDate, endDate }: Props) => {
	const router = useRouter();
	const { isLight } = useAppTheme();

	const onPress = (type: ReportType) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.navigate({
			pathname: `/report/${type}`,
			params: {
				startDate: startDate.getTime().toString(),
				endDate: endDate.getTime().toString(),
			},
		});
	};

	return (
		<Pressable onPress={() => onPress(item.id)}>
			<View className="rounded-lg bg-gray-300 p-4 shadow-md dark:bg-gray-700">
				{item.rows.map((row, index) => (
					<View
						key={row.label}
						className={cn(
							"flex-row justify-between",
							index < item.rows.length - 1
								? "border-border border-b pb-2"
								: "pt-2",
							index > 0 && index < item.rows.length - 1 && "py-2",
						)}
					>
						<Text
							className={cn("text-foreground", !isLight && "text-gray-300")}
						>
							{row.label}
						</Text>
						<Text
							className={cn(
								row.isBold && "font-bold",
								row.isLarge && "text-lg",
								!row.isBold && "font-semibold text-foreground",
								!isLight && "text-gray-300",
							)}
						>
							{row.value}
						</Text>
					</View>
				))}
			</View>
		</Pressable>
	);
};
