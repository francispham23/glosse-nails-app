import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";

// ── Types ────────────────────────────────────────────────────────────────

type CashTransaction = {
	_id: string;
	serviceDate: number | undefined;
	technician: string | undefined;
	tip: number;
	compensation: number;
	realCash: number;
	tipInCash?: number;
	tipMethods?: string[];
	supply?: number;
	discount?: number;
};

type TechnicianSummary = {
	_id: string;
	cashTips: number;
	supply: number;
	discount: number;
};

// ── Helpers (pure, defined once) ─────────────────────────────────────────

function isCashTransaction(tx: {
	compInCash?: number;
	tipInCash?: number;
	compensationMethods?: string[];
	tipMethods?: string[];
}): boolean {
	return (
		(tx.compInCash != null && tx.compInCash > 0) ||
		(tx.tipInCash != null && tx.tipInCash > 0) ||
		(!tx.compensationMethods?.includes("Card") &&
			!!tx.compensationMethods?.includes("Cash")) ||
		(!tx.tipMethods?.includes("Card") && !!tx.tipMethods?.includes("Cash"))
	);
}

function getCashCompensation(tx: {
	compInCash?: number;
	compensation?: number;
	compensationMethods?: string[];
}): number {
	return (
		(tx.compInCash || 0) +
		(tx.compensationMethods?.includes("Cash") &&
		!tx.compensationMethods?.includes("Card")
			? tx.compensation || 0
			: 0)
	);
}

function getCashTip(tx: {
	tipInCash?: number;
	tip?: number;
	tipMethods?: string[];
}): number {
	return (
		(tx.tipInCash || 0) +
		(tx.tipMethods?.includes("Cash") && !tx.tipMethods?.includes("Card")
			? tx.tip || 0
			: 0)
	);
}

// ── Stable empty-list elements (never re-created) ────────────────────────

const EmptyTechnician = <ListEmptyComponent item="technician" />;
const EmptyCash = <ListEmptyComponent item="cash" />;

// ── Memoised sub-components ──────────────────────────────────────────────

const CashCard = memo(({ item }: { item: CashTransaction }) => {
	const { isLight } = useAppTheme();
	const base = cn("text-muted text-sm", !isLight && "text-gray-300");

	return (
		<View className="flex-row items-center rounded-lg border-r-accent bg-gray-300 p-2 shadow-md dark:bg-gray-700">
			<Text className={cn(base, "min-w-[50]")}>
				{item.serviceDate
					? new Date(item.serviceDate).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						})
					: "N/A"}
			</Text>
			<Text className={cn(base, "min-w-[40] flex-1 text-left")}>
				{item.technician?.split(" ")[0] || "Unknown"}
			</Text>
			<Text className={cn(base, "min-w-[60] text-right")}>
				${item.tip.toFixed(2)}
			</Text>
			<Text className={cn(base, "min-w-[90] text-right")}>
				${item.compensation.toFixed(2)}
			</Text>
			<Text className={cn(base, "min-w-[80] text-right")}>
				${item.realCash.toFixed(2)}
			</Text>
		</View>
	);
});

const TechnicianCashCard = memo(({ item }: { item: TechnicianSummary }) => {
	const { isLight } = useAppTheme();
	const base = cn("text-muted text-sm", !isLight && "text-gray-300");

	return (
		<View className="flex-row items-center rounded-lg border-r-accent bg-gray-300 p-2 shadow-md dark:bg-gray-700">
			<Text className={cn(base, "min-w-[50] flex-1")}>
				{item._id?.split(" ")[0] ?? "Unknown"}
			</Text>
			<Text className={cn(base, "min-w-[60] text-right")}>
				${item.cashTips.toFixed(2)}
			</Text>
			<Text className={cn(base, "min-w-[90] text-right")}>
				${item.supply.toFixed(2)}
			</Text>
			<Text className={cn(base, "min-w-[80] text-right")}>
				${item.discount.toFixed(2)}
			</Text>
		</View>
	);
});

// ── Screen ───────────────────────────────────────────────────────────────

export default function CashReportRoute() {
	const { isLight } = useAppTheme();
	const params = useLocalSearchParams();
	const startDate = params.startDate ? Number(params.startDate) : Date.now();
	const endDate = params.endDate ? Number(params.endDate) : Date.now();

	const transactions = useQuery(api.transactions.listByDateRange, {
		startDate,
		endDate,
	});

	// Derived data — only recomputed when `transactions` changes
	const cashTransactions = useMemo<CashTransaction[]>(() => {
		if (!transactions) return [];
		return transactions.filter(isCashTransaction).map((tx) => {
			const compensation = getCashCompensation(tx);
			const tip = getCashTip(tx);
			const supply = tx.isCashSupply ? tx.supply || 0 : 0;
			const discount = tx.isCashDiscount ? tx.discount || 0 : 0;
			const realCash = (compensation + supply) * 1.05;
			return {
				...tx,
				tip,
				supply,
				discount,
				compensation,
				realCash,
			};
		});
	}, [transactions]);

	const technicians = useMemo<TechnicianSummary[]>(() => {
		const map: Record<string, TechnicianSummary> = {};
		for (const tx of cashTransactions) {
			if (!tx.technician) continue;
			const key = tx.technician;
			if (!map[key]) {
				map[key] = { _id: key, cashTips: 0, supply: 0, discount: 0 };
			}
			map[key].cashTips += getCashTip(tx);
			map[key].supply += tx.supply || 0;
			map[key].discount += tx.discount || 0;
		}
		return Object.values(map);
	}, [cashTransactions]);

	// Stable callbacks so FlatList never re-renders just because of a new function ref
	const renderTechnicianCard = useCallback(
		({ item }: { item: TechnicianSummary }) => (
			<TechnicianCashCard item={item} />
		),
		[],
	);

	const renderCashCard = useCallback(
		({ item }: { item: CashTransaction }) => <CashCard item={item} />,
		[],
	);

	const techKeyExtractor = useCallback(
		(item: TechnicianSummary) => item._id,
		[],
	);
	const cashKeyExtractor = useCallback((item: CashTransaction) => item._id, []);

	const headerCn = cn(
		"font-semibold text-foreground",
		!isLight && "text-gray-300",
	);

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text
				className={cn(
					"font-extrabold text-3xl text-foreground",
					!isLight && "text-gray-300",
				)}
			>
				Cash Report
			</Text>

			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={headerCn}>Technician</Text>
					<Text className={cn(headerCn, "text-right")}>Cash Tips</Text>
					<Text className={cn(headerCn, "text-right")}>Supply</Text>
					<Text className={cn(headerCn, "text-right")}>Discount</Text>
				</View>

				<FlatList
					data={technicians}
					keyExtractor={techKeyExtractor}
					renderItem={renderTechnicianCard}
					contentContainerClassName="gap-2"
					ListEmptyComponent={EmptyTechnician}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
				/>
			</View>

			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={cn(headerCn, "max-w-[60]")}>Date</Text>
					<Text className={cn(headerCn, "text-right")}>Technician</Text>
					<Text className={cn(headerCn, "text-right")}>Tip</Text>
					<Text className={cn(headerCn, "text-right")}>Compensation</Text>
					<Text className={cn(headerCn, "text-right")}>Real Cash</Text>
				</View>

				<FlatList
					data={cashTransactions}
					keyExtractor={cashKeyExtractor}
					renderItem={renderCashCard}
					contentContainerClassName="gap-2"
					ListEmptyComponent={EmptyCash}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
				/>
			</View>
		</Animated.View>
	);
}
