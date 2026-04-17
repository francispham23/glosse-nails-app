import { useState } from "react";
import { View } from "react-native";
import { Chip } from "react-native-paper";
import type { Category, PaymentMethod } from "@/utils/types";

const HIDDEN_SERVICE_KEYWORDS = [
	"Dual",
	"Wax",
	"Massage",
	"Gel-X",
	"PC",
	"FS",
] as const;

const shouldHideCategory = (name: string) => {
	const normalizedName = name.toLowerCase();

	return HIDDEN_SERVICE_KEYWORDS.some((keyword) =>
		normalizedName.includes(keyword.toLowerCase()),
	);
};

type PaymentMethodChipsProps = {
	methods: readonly PaymentMethod[];
	selectedMethods: PaymentMethod[];
	onSelect: (method: PaymentMethod) => void;
	disableGift?: boolean;
};

export const PaymentMethodChips = ({
	methods,
	selectedMethods,
	onSelect,
	disableGift,
}: PaymentMethodChipsProps) => (
	<View className="flex-row flex-wrap gap-2">
		{methods.map((method) => (
			<Chip
				key={method}
				selected={selectedMethods.includes(method)}
				disabled={disableGift && method === "Gift Card"}
				className={
					selectedMethods.includes(method) ? "opacity-60" : "opacity-100"
				}
				onPress={() => onSelect(method)}
			>
				{method}
			</Chip>
		))}
	</View>
);

type ServiceCategoryChipsProps = {
	categories: Category[] | undefined;
	selectedServices: string[];
	onSelect: (id: Category["_id"]) => void;
};

export const ServiceCategoryChips = ({
	categories,
	selectedServices,
	onSelect,
}: ServiceCategoryChipsProps) => {
	const [show, setShow] = useState(false);
	const selectedServiceIds = new Set(selectedServices);
	const hasHiddenCategories =
		categories?.some(
			(category) =>
				shouldHideCategory(category.name) &&
				!selectedServiceIds.has(category._id),
		) ?? false;
	const visibleCategories =
		show || !categories
			? categories
			: categories.filter(
					(category) =>
						!shouldHideCategory(category.name) ||
						selectedServiceIds.has(category._id),
				);

	return (
		<View className="mt-4 mb-4 flex-row flex-wrap gap-2">
			{visibleCategories?.map((category) => (
				<Chip
					key={category._id}
					selected={selectedServiceIds.has(category._id)}
					className={
						selectedServiceIds.has(category._id) ? "opacity-60" : "opacity-100"
					}
					onPress={() => onSelect(category._id)}
				>
					{category.name}
				</Chip>
			))}
			{!show && hasHiddenCategories && (
				<Chip key="more" onPress={() => setShow(true)}>
					More Services...
				</Chip>
			)}
		</View>
	);
};
