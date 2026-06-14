import { useEffect } from "react";
import { View } from "react-native";
import { ErrorText } from "@/components/Form/form";
import { NumericInput } from "@/components/Form/numeric-input";
import { OtherInputChips } from "@/components/TransactionForm/form-chips";
import type { EarningFormState } from "@/utils";
import type { SelectedInput, UpdateEarning } from ".";

interface OthersSectionProps {
	updateEarning: UpdateEarning;
	mutedColor: string;
	getFieldError: (field: string) => string | undefined;
	selectedInputs: SelectedInput[];
	setSelectedInputs: React.Dispatch<React.SetStateAction<SelectedInput[]>>;
	earning: EarningFormState;
	setEarning: React.Dispatch<React.SetStateAction<EarningFormState>>;
}

export function OthersSection({
	updateEarning,
	mutedColor,
	getFieldError,
	selectedInputs,
	setSelectedInputs,
	earning,
	setEarning,
}: OthersSectionProps) {
	const { discount, discountType, supply, isCashSupply, isCashDiscount } =
		earning;

	const showSupply = selectedInputs.includes("Supply");
	const showDiscount = selectedInputs.includes("Discount");

	useEffect(() => {
		if (showDiscount && earning.discountType === undefined) {
			setEarning((prev) => ({ ...prev, discountType: "Amount" }));
		} else if (!showDiscount) {
			setEarning((prev) => ({ ...prev, discountType: undefined }));
		}
	}, [showDiscount, setEarning, earning.discountType]);

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
						placeholder={`Enter ${isCashDiscount ? "Cash" : ""} Discount${discountType ? ` ${discountType}` : ""}`}
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
				updateEarning={updateEarning}
			/>
		</View>
	);
}
