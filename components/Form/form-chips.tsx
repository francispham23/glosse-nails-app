import { View } from "react-native";
import { Chip } from "react-native-paper";

import type { Category, PaymentMethod } from "@/utils/types";

type PaymentMethodChipsProps = {
	methods: readonly PaymentMethod[];
	selectedMethods: PaymentMethod[];
	onSelect: (method: PaymentMethod) => void;
};

export const PaymentMethodChips = ({
	methods,
	selectedMethods,
	onSelect,
}: PaymentMethodChipsProps) => (
	<View className="flex-row flex-wrap gap-2">
		{methods.map((method) => (
			<Chip
				key={method}
				selected={selectedMethods.includes(method)}
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
}: ServiceCategoryChipsProps) => (
	<View className="mt-4 mb-4 flex-row flex-wrap gap-2">
		{categories?.map((category) => (
			<Chip
				key={category._id}
				selected={selectedServices.includes(category._id)}
				className={
					selectedServices.includes(category._id) ? "opacity-60" : "opacity-100"
				}
				onPress={() => onSelect(category._id)}
			>
				{category.name}
			</Chip>
		))}
	</View>
);
