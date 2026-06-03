import { Text, View } from "react-native";

import { paymentMethods } from "@/components/Form/constants";
import { ErrorText } from "@/components/Form/form";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import { NumericInput } from "@/components/Form/numeric-input";
import { PaymentMethodChips } from "@/components/TransactionForm/form-chips";

import type { EarningFormState, Gift, PaymentMethod } from "@/utils";

interface CompensationSectionProps {
	compensation: EarningFormState["compensation"];
	compInCash: EarningFormState["compInCash"];
	compInGift: EarningFormState["compInGift"];
	cash: boolean;
	card: boolean;
	gift: boolean;
	compensationMethods: EarningFormState["compensationMethods"];
	compensationPlaceholder: string;
	mutedColor: string;
	earning: EarningFormState;
	updateEarning: <K extends keyof EarningFormState>(
		key: K,
		value: EarningFormState[K],
	) => void;
	giftCard: Gift | null | undefined;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	getFieldError: (field: string) => string | undefined;
	onSelectCompensationMethod: (method: PaymentMethod) => void;
}

export function CompensationSection({
	compensation,
	compInCash,
	compInGift,
	cash,
	card,
	gift,
	compensationMethods,
	compensationPlaceholder,
	mutedColor,
	earning,
	updateEarning,
	giftCard,
	giftError,
	setGiftError,
	getFieldError,
	onSelectCompensationMethod,
}: CompensationSectionProps) {
	return (
		<View className="flex gap-2">
			{/* Compensation Input */}
			<NumericInput
				placeholder={compensationPlaceholder || "Select Compensation Methods"}
				value={compensation.toString()}
				onChangeText={(value) => updateEarning("compensation", value)}
				icon="credit-card-outline"
				iconColor={mutedColor}
			/>
			<ErrorText error={getFieldError("compensation")} />
			{!compensationPlaceholder ? (
				<Text className="px-4 text-red-500 text-sm">
					Please select at least one compensation method
				</Text>
			) : null}
			{/* Cash Amount (when both Cash and Card selected) */}
			{cash && card ? (
				<>
					<NumericInput
						placeholder="Enter Cash Amount"
						value={compInCash?.toString()}
						onChangeText={(value) => updateEarning("compInCash", value)}
						icon="cash-multiple"
						iconColor={mutedColor}
					/>
					<ErrorText error={getFieldError("compInCash")} />
				</>
			) : null}
			{/* Gift Card Inputs for Compensation */}
			<GiftCardInputs
				earning={earning}
				updateEarning={updateEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				type={gift ? "compInGift" : undefined}
			/>
			<ErrorText error={getFieldError("compInGift")} />
			{/* Compensation Methods */}
			<PaymentMethodChips
				methods={paymentMethods}
				selectedMethods={compensationMethods}
				onSelect={onSelectCompensationMethod}
				disableGift={!!compInGift}
			/>
		</View>
	);
}
