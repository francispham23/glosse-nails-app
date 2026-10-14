import { useQuery } from "convex/react";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { type Report, ReportCard } from "@/components/Cards/report-card";
import { ListEmptyComponent } from "@/components/list-empty";
import { ReportDateControls } from "@/components/workspace/report-date-controls";
import {
	WorkspaceListFooter,
	WorkspaceScreen,
} from "@/components/workspace/screen";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { useAuthorization } from "@/hooks/use-authorization";
import { getDiscount } from "@/utils";
import { getCashCompensation, getCashTip } from "@/utils/financial-validation";

export default function ReportsRoute() {
	const { startOfDay, endOfDay } = useAppDate();
	const { isAuthorized } = useAuthorization();

	const [startDate, setStartDate] = useState<Date>(startOfDay);
	const [endDate, setEndDate] = useState<Date>(endOfDay);

	const rangeStart = new Date(startDate);
	rangeStart.setHours(0, 0, 0, 0);
	const rangeEnd = new Date(endDate);
	rangeEnd.setHours(23, 59, 59, 999);

	// Query technicians with totals for the selected date range
	const technicians = useQuery(api.users.usersByDateRange, {
		startDate: rangeStart.getTime(),
		endDate: rangeEnd.getTime(),
		report: true,
	});

	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate: rangeStart.getTime(),
		endDate: rangeEnd.getTime(),
		report: true,
	});

	const giftCards = useQuery(api.giftCards.listByDateRange, {
		startDate: rangeStart.getTime(),
		endDate: rangeEnd.getTime(),
	});

	const totalGiftCardBalance =
		giftCards?.reduce((sum, giftCard) => sum + giftCard.balance, 0) || 0;

	const totalCompensation =
		technicians?.reduce((sum, tech) => sum + tech.compensation, 0) ?? 0;
	const totalTip = technicians?.reduce((sum, tech) => sum + tech.tip, 0) ?? 0;
	const grandTotal = totalCompensation + totalTip;

	const totalDiscount =
		transactions?.reduce((sum, tx) => sum + getDiscount(tx), 0) ?? 0;

	const totalSupply =
		transactions?.reduce((sum, tx) => sum + (tx.supply || 0), 0) ?? 0;

	const totalCompCash =
		transactions?.reduce((sum, tx) => sum + getCashCompensation(tx), 0) ?? 0;
	const totalTipCash =
		transactions?.reduce((sum, tx) => sum + getCashTip(tx), 0) ?? 0;

	const totalSupplyCash =
		transactions?.reduce((sum, tx) => {
			return sum + (tx.isCashSupply ? tx.supply || 0 : 0);
		}, 0) ?? 0;

	const totalCash = totalCompCash + totalTipCash + totalSupplyCash;

	const totalDiscountCash =
		transactions?.reduce((sum, tx) => {
			return sum + (tx.isCashDiscount ? getDiscount(tx) : 0);
		}, 0) ?? 0;

	const totalRealCash = totalCash - totalDiscountCash - totalTipCash;

	const totalIncome =
		transactions?.reduce((sum, tx) => sum + (tx.compensation || 0), 0) ?? 0;

	const netIncome = totalIncome - totalCompensation;

	// Build report cards data
	const reportCards: Report[] = [
		{
			id: "payroll",
			title: "Payroll",
			rows: [
				{
					label: "Total Compensation:",
					value: `$${totalCompensation.toFixed(2)}`,
				},
				{ label: "Total Tips:", value: `$${totalTip.toFixed(2)}` },
				{
					label: "Grand Total:",
					value: `$${grandTotal.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "cash",
			title: "Cash",
			rows: [
				{
					label: "Total Service Cash:",
					value: `$${totalCompCash.toFixed(2)}`,
				},
				{ label: "Total Tip Cash:", value: `$${totalTipCash.toFixed(2)}` },
				{
					label: "Total Supply Cash:",
					value: `$${totalSupplyCash.toFixed(2)}`,
				},
				{
					label: "Total Cash Collected:",
					value: `$${totalCash.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
				{
					label: "(Total Discount Cash):",
					value: `- $${totalDiscountCash.toFixed(2)}`,
				},
				{
					label: "(Total Tip Cash):",
					value: `- $${totalTipCash.toFixed(2)}`,
				},
				{
					label: "Total Real Cash:",
					value: `$${totalRealCash.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "discount",
			title: "Discounts",
			rows: [
				{
					label: "Total Discount:",
					value: `$${totalDiscount.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "supply",
			title: "Supply",
			rows: [
				{
					label: "Total Supply:",
					value: `$${totalSupply.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "income",
			title: "Income",
			rows: [
				{
					label: "Total Income:",
					value: `$${totalIncome.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
				{
					label: "Total Compensation:",
					value: `- $${totalCompensation.toFixed(2)}`,
				},
				{
					label: "Net Income:",
					value: `$${netIncome.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
		{
			id: "gift",
			title: "Gift Cards",
			rows: [
				{
					label: "Total Balance Gift Cards:",
					value: `$${totalGiftCardBalance.toFixed(2)}`,
					isBold: true,
					isLarge: true,
				},
			],
		},
	];
	const filteredReportCards = reportCards.filter((card) =>
		isAuthorized ? true : card.id !== "income" && card.id !== "gift",
	);
	// If all row values are 0, don't show the card
	const noValues = filteredReportCards.every((item) =>
		item.rows.every((row) => row.value === "$0.00" || row.value === "- $0.00"),
	);
	const data = noValues ? [] : filteredReportCards;

	const endOfToday = new Date();
	endOfToday.setHours(23, 59, 59, 999);

	const loading =
		technicians === undefined ||
		transactions === undefined ||
		giftCards === undefined;
	return (
		<WorkspaceScreen
			title="Reports"
			description="Review your selected period’s figures."
			actions={
				<ReportDateControls
					startDate={startDate}
					endDate={endDate}
					maximumDate={endOfToday}
					onApply={(start, end) => {
						setStartDate(start);
						setEndDate(end);
					}}
				/>
			}
		>
			<ScrollView
				contentContainerStyle={{
					paddingTop: 8,
					paddingBottom: 32,
					flexGrow: 1,
				}}
			>
				{loading || data.length === 0 ? (
					<ListEmptyComponent item="report" loading={loading} />
				) : (
					<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
						{data
							.filter((item) => item.rows[0].value !== "$0.00")
							.map((item) => (
								<View
									key={item.id}
									style={{
										flexGrow: 1,
										flexBasis: 320,
										minWidth: 0,
										maxWidth: "100%",
									}}
								>
									<ReportCard
										overview
										item={item}
										startDate={rangeStart}
										endDate={rangeEnd}
									/>
								</View>
							))}
					</View>
				)}
				<WorkspaceListFooter />
			</ScrollView>
		</WorkspaceScreen>
	);
}
