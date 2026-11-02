import { Text, View } from "react-native";
import { paymentMethods } from "@/components/Form/constants";
import { ErrorText } from "@/components/Form/form";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import { NumericInput } from "@/components/Form/numeric-input";
import { PaymentMethodChips } from "@/components/TransactionForm/form-chips";
import type { EarningFormState, Gift, PaymentMethod } from "@/utils";
import { cashRemainderPreview } from "@/utils/financial-validation";
import type { UpdateEarning } from ".";

interface CompensationSectionProps {
	cash: boolean;
	card: boolean;
	gift: boolean;
	compensationPlaceholder: string;
	mutedColor: string;
	earning: EarningFormState;
	updateEarning: UpdateEarning;
	giftCard: Gift | null | undefined;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	getFieldError: (field: string) => string | undefined;
	onSelectCompensationMethod: (method: PaymentMethod) => void;
}

export function CompensationSection({
	cash,
	card,
	gift,
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
	const { compensation, compInCash, compInGift, compensationMethods } = earning;

	const cashRemainder = cashRemainderPreview(compensation, compInGift);

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
				<Text className="px-4 text-error text-sm">
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

			{cash && gift && !card && cashRemainder !== undefined ? (
				<Text className="px-4 text-muted-foreground">
					Cash remainder: ${cashRemainder.toFixed(2)}
				</Text>
			) : null}
			<ErrorText error={getFieldError("giftCode")} />
			{/* Compensation Methods */}
			<View className="flex-row flex-wrap gap-2">
				<PaymentMethodChips
					methods={paymentMethods}
					selectedMethods={compensationMethods}
					onSelect={onSelectCompensationMethod}
					disableGift={!!compInGift}
				/>
			</View>
		</View>
	);
}
