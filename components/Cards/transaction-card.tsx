import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { Text as PaperText, useTheme } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
	Amount,
	OverviewCard,
	RowIndicator,
} from "@/components/workspace/card";
import { workspaceStyles } from "@/components/workspace/screen";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";
import { cn, isToday, type Transaction } from "@/utils";
import { blurActiveElementOnWeb } from "@/utils/web-focus";

function openTransactionEdit(transactionId: string) {
	blurActiveElementOnWeb();
	router.navigate(`/transaction/${transactionId}/edit`);
}

type Props = {
	overview?: boolean;
	transaction: Transaction;
	isAuthorized?: boolean;
	technicianId?: string;
	userName?: string;
};

export const TransactionCard = ({
	transaction,
	overview = false,
	technicianId,
	isAuthorized,
	userName,
}: Props) => {
	const { isLight } = useAppTheme();
	const { colors } = useTheme();
	const { isWide, isCompact } = useWorkspaceLayout();
	const { endOfDay } = useAppDate();
	const className = cn("text-lg text-muted", !isLight && "text-gray-300");

	const isSelectedDateToday = isToday(endOfDay.getTime());
	const showClient =
		transaction.client && transaction.client !== transaction.technician;

	// Disable the card if the user is not authorized and is not the technician and date is not today
	const isDisabled =
		(!isAuthorized && transaction.technician !== userName) ||
		(!isAuthorized &&
			transaction.technician === userName &&
			!isSelectedDateToday);
	if (overview && isCompact)
		return (
			<OverviewCard
				label={`Transaction for ${transaction.technician}, compensation $${transaction.compensation}, tip $${transaction.tip}`}
				disabled={isDisabled}
				onPress={() => openTransactionEdit(transaction._id)}
			>
				<View style={{ padding: 12, gap: 8 }}>
					<View
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							alignItems: "center",
							gap: 12,
						}}
					>
						<View style={{ flex: 1, minWidth: 72, gap: 4 }}>
							<PaperText style={{ fontSize: 16, fontWeight: "600" }}>
								{transaction.technician}
							</PaperText>
							{transaction.serviceDate ? (
								<PaperText
									style={{ color: colors.onSurfaceVariant, fontSize: 12 }}
								>
									{getServiceDateString(
										transaction.serviceDate,
										isSelectedDateToday,
									)}
								</PaperText>
							) : null}
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
								maxWidth: "100%",
								minWidth: 0,
							}}
						>
							<View style={[workspaceStyles.numbers, { gap: 12 }]}>
								<Amount
									label="Compensation"
									value={`$${transaction.compensation}`}
								/>
								<Amount label="Tip" value={`$${transaction.tip}`} />
							</View>
							{!isDisabled ? <RowIndicator /> : null}
						</View>
					</View>
					{showClient || transaction.services ? (
						<View style={{ gap: 4 }}>
							{showClient ? (
								<PaperText style={{ color: colors.onSurfaceVariant }}>
									Client: {transaction.client}
								</PaperText>
							) : null}
							{transaction.services ? (
								<PaperText
									style={{ color: colors.onSurfaceVariant, lineHeight: 22 }}
								>
									{transaction.services}
								</PaperText>
							) : null}
						</View>
					) : null}
				</View>
			</OverviewCard>
		);

	if (overview)
		return (
			<OverviewCard
				label={`Transaction for ${transaction.technician}, compensation $${transaction.compensation}, tip $${transaction.tip}`}
				disabled={isDisabled}
				onPress={() => openTransactionEdit(transaction._id)}
			>
				<View style={[workspaceStyles.row, { alignItems: "flex-start" }]}>
					<View
						style={[workspaceStyles.name, !isWide && { flexBasis: "100%" }]}
					>
						<PaperText style={{ fontSize: 16, fontWeight: "600" }}>
							{transaction.technician}
						</PaperText>
						{showClient ? (
							<PaperText style={{ color: colors.onSurfaceVariant }}>
								Client: {transaction.client}
							</PaperText>
						) : null}
						{transaction.services ? (
							<PaperText
								style={{ color: colors.onSurfaceVariant, lineHeight: 22 }}
							>
								{transaction.services}
							</PaperText>
						) : null}
						{transaction.serviceDate ? (
							<PaperText
								style={{ color: colors.onSurfaceVariant, fontSize: 12 }}
							>
								{getServiceDateString(
									transaction.serviceDate,
									isSelectedDateToday,
								)}
							</PaperText>
						) : null}
					</View>
					<View style={workspaceStyles.numbers}>
						<Amount
							label="Compensation"
							value={`$${transaction.compensation}`}
						/>
						<Amount label="Tip" value={`$${transaction.tip}`} />
					</View>
					{!isDisabled ? <RowIndicator /> : null}
				</View>
			</OverviewCard>
		);

	return (
		<Pressable
			onPress={() => {
				if (isDisabled) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
					return;
				}
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				openTransactionEdit(transaction._id);
			}}
			disabled={isDisabled}
		>
			<Animated.View
				key={transaction._id}
				entering={FadeIn}
				exiting={FadeOut}
				className={cn(
					"gap-3 rounded-lg border-r-accent bg-gray-300 p-3 dark:bg-gray-700",
					Platform.OS !== "web" && "shadow-md",
				)}
				style={
					Platform.OS === "web"
						? {
								boxShadow:
									"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
							}
						: undefined
				}
			>
				{/* Render transaction details here */}
				{!technicianId ? (
					<Text className={className}>
						Technician: {transaction.technician}
					</Text>
				) : null}
				<Text className={className}>
					Compensation: ${transaction.compensation}
				</Text>
				<Text className={className}>Tip: ${transaction.tip}</Text>
				{showClient ? (
					<Text className={className}>Client: {transaction.client}</Text>
				) : null}
				{transaction.services ? (
					<Text className={className}>Services: {transaction.services}</Text>
				) : null}
				{transaction.serviceDate ? (
					<Text className={className}>
						{getServiceDateString(transaction.serviceDate, isSelectedDateToday)}
					</Text>
				) : null}
			</Animated.View>
		</Pressable>
	);
};

const getServiceDateString = (
	timestamp: number | undefined,
	isCurrent: boolean,
) => {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	const time = date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	const dayInWeek = date.toLocaleDateString("en-US", {
		weekday: "short",
	});
	if (isCurrent) {
		return `At: ${time}.`;
	}
	const fullDate = date.toLocaleDateString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	});
	return `Date: ${dayInWeek}, ${fullDate} ${time}.`;
};
