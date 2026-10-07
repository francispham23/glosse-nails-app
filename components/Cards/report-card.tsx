import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Text as PaperText, useTheme } from "react-native-paper";
import { OverviewCard } from "@/components/workspace/card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";

type ReportType =
	| "payroll"
	| "discount"
	| "cash"
	| "gift"
	| "supply"
	| "income";

export type Report = {
	id: ReportType;
	title: string;
	rows: {
		label: string;
		value: string;
		isBold?: boolean;
		isLarge?: boolean;
	}[];
};

type Props = {
	overview?: boolean;
	item: Report;
	startDate: Date;
	endDate: Date;
};

export const ReportCard = ({
	item,
	startDate,
	endDate,
	overview = false,
}: Props) => {
	const router = useRouter();
	const { isLight } = useAppTheme();
	const { colors } = useTheme();

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

	// If first row value is 0, don't show the card
	if (item.rows[0].value === "$0.00") {
		return null;
	}

	if (overview)
		return (
			<OverviewCard
				label={`View ${item.title} report`}
				onPress={() => onPress(item.id)}
			>
				<View style={{ padding: 20, gap: 16 }}>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 8,
						}}
					>
						<PaperText style={{ fontWeight: "700", fontSize: 18, flex: 1 }}>
							{item.title}
						</PaperText>
						<PaperText style={{ color: colors.primary }}>↗</PaperText>
					</View>
					{item.rows.map((row) => (
						<View
							key={row.label}
							style={{
								flexDirection: "row",
								flexWrap: "wrap",
								justifyContent: "space-between",
								gap: 8,
								paddingTop: 12,
								borderTopWidth: 1,
								borderColor: colors.outlineVariant,
							}}
						>
							<PaperText
								style={{
									color: colors.onSurfaceVariant,
									flex: 1,
									minWidth: 100,
									lineHeight: 22,
								}}
							>
								{row.label}
							</PaperText>
							<PaperText
								style={{
									fontWeight: row.isBold ? "700" : "500",
									fontSize: row.isLarge ? 20 : 14,
									fontVariant: ["tabular-nums"],
									flexShrink: 1,
								}}
							>
								{row.value}
							</PaperText>
						</View>
					))}
				</View>
			</OverviewCard>
		);

	return (
		<Pressable onPress={() => onPress(item.id)}>
			<View className="rounded-lg bg-gray-300 p-4 shadow-md dark:bg-gray-700">
				<Text
					className={cn(
						"mb-2 font-semibold text-lg",
						!isLight && "text-gray-300",
					)}
				>
					{item.title}
				</Text>
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
