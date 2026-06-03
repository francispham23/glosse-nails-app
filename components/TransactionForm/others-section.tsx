import { View } from "react-native";

import { ErrorText } from "@/components/Form/form";
import { NumericInput } from "@/components/Form/numeric-input";
import { OtherInputChips } from "@/components/TransactionForm/form-chips";

import type { EarningFormState } from "@/utils";
import type { SelectedInput } from "./transaction-form";

interface OthersSectionProps {
	showSupply: boolean;
	showDiscount: boolean;
	isCashSupply: EarningFormState["isCashSupply"];
	isCashDiscount: EarningFormState["isCashDiscount"];
	supply: EarningFormState["supply"];
	discount: EarningFormState["discount"];
	updateEarning: <K extends keyof EarningFormState>(
		key: K,
		value: EarningFormState[K],
	) => void;
	mutedColor: string;
	getFieldError: (field: string) => string | undefined;
	selectedInputs: SelectedInput[];
	setSelectedInputs: React.Dispatch<React.SetStateAction<SelectedInput[]>>;
	earning: EarningFormState;
}

export function OthersSection({
	showSupply,
	showDiscount,
	isCashSupply,
	isCashDiscount,
	supply,
	discount,
	updateEarning,
	mutedColor,
	getFieldError,
	selectedInputs,
	setSelectedInputs,
	earning,
}: OthersSectionProps) {
	return (
		<View className="flex gap-2">
			{/* Supply Input */}
			{showSupply ? (
				<>
					<NumericInput
						placeholder={`Enter ${isCashSupply ? "Cash" : ""} Supply Cost`}
						value={supply?.toString()}
						onChangeText={(value) => updateEarning("supply", value)}
						icon="package-variant"
						iconColor={mutedColor}
					/>
					<ErrorText error={getFieldError("supply")} />
				</>
			) : null}
			{/* Discount Input */}
			{showDiscount ? (
				<>
					<NumericInput
						placeholder={`Enter ${isCashDiscount ? "Cash" : ""} Discount Amount`}
						value={discount?.toString()}
						onChangeText={(value) => updateEarning("discount", value)}
						icon="cash-minus"
						iconColor={mutedColor}
					/>
					<ErrorText error={getFieldError("discount")} />
				</>
			) : null}
			{/* Other Input Toggles */}
			<OtherInputChips
				selectedInputs={selectedInputs}
				setSelectedInputs={setSelectedInputs}
				earning={earning}
			/>
		</View>
	);
}
