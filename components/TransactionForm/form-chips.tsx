import { useCallback, useState } from "react";
import { View } from "react-native";
import { Chip } from "react-native-paper";

import type { Category, EarningFormState, PaymentMethod } from "@/utils/types";
import { otherInputs } from "../Form/constants";
import type { SelectedInput } from "./transaction-form";

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
			{!show && hasHiddenCategories ? (
				<Chip key="more" onPress={() => setShow(true)}>
					More Services...
				</Chip>
			) : null}
		</View>
	);
};

type OtherInputs = (typeof otherInputs)[number];
type OtherInputChipsProps = {
	selectedInputs: OtherInputs[];
	setSelectedInputs: React.Dispatch<React.SetStateAction<OtherInputs[]>>;
	earning: EarningFormState;
};

export const OtherInputChips = ({
	selectedInputs,
	setSelectedInputs,
	earning,
}: OtherInputChipsProps) => {
	const toggleInput = useCallback(
		(input: SelectedInput) => {
			setSelectedInputs((prev) =>
				prev.includes(input)
					? prev.filter((i) => i !== input)
					: [...prev, input],
			);
		},
		[setSelectedInputs],
	);
	return (
		<View className="flex-row flex-wrap gap-2">
			{otherInputs.map((input) => (
				<Chip
					key={input}
					selected={selectedInputs.includes(input)}
					disabled={
						selectedInputs.includes(input) &&
						earning[input.toLocaleLowerCase() as keyof EarningFormState] !== ""
					}
					className={
						selectedInputs.includes(input) ? "opacity-60" : "opacity-100"
					}
					onPress={() => toggleInput(input)}
				>
					{input}
				</Chip>
			))}
		</View>
	);
};
