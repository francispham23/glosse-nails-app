import { View } from "react-native";

import { paymentMethods } from "@/components/Form/constants";
import { ErrorText } from "@/components/Form/form";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import { NumericInput } from "@/components/Form/numeric-input";
import { PaymentMethodChips } from "@/components/TransactionForm/form-chips";

import type { EarningFormState, Gift, PaymentMethod } from "@/utils";
import { getPaymentPlaceholder } from "../Form/helpers";
import type { UpdateEarning } from ".";

interface TipSectionProps {
	tipCash: boolean;
	tipCard: boolean;
	tipGift: boolean;
	mutedColor: string;
	earning: EarningFormState;
	updateEarning: UpdateEarning;
	giftCard: Gift | null | undefined;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	getFieldError: (field: string) => string | undefined;
	onSelectTipMethod: (method: PaymentMethod) => void;
}

export function TipSection({
	tipCash,
	tipCard,
	tipGift,
	mutedColor,
	earning,
	updateEarning,
	giftCard,
	giftError,
	setGiftError,
	getFieldError,
	onSelectTipMethod,
}: TipSectionProps) {
	const { tipMethods, tip, tipInCash, compInGift, tipInGift } = earning;
	const tipPlaceholder = getPaymentPlaceholder(tipCard, tipCash, tipGift, true);

	return (
		<View className="flex gap-2">
			{tipMethods.length > 0 ? (
				<>
					{/* Tip Input */}
					<NumericInput
						placeholder={tipPlaceholder || "Select Tip Methods"}
						value={tip === "0" ? "" : tip.toString()}
						onChangeText={(value) => updateEarning("tip", value)}
						icon="credit-card-outline"
						iconColor={mutedColor}
					/>
					<ErrorText error={getFieldError("tip")} />
					{tipCash && tipCard ? (
						<>
							<NumericInput
								placeholder="Enter Tip in Cash Amount"
								value={tipInCash?.toString()}
								onChangeText={(value) => updateEarning("tipInCash", value)}
								icon="cash-multiple"
								iconColor={mutedColor}
							/>
							<ErrorText error={getFieldError("tipInCash")} />
						</>
					) : null}
					{/* Gift Card Inputs for Tip */}
					<GiftCardInputs
						earning={earning}
						updateEarning={updateEarning}
						giftCard={giftCard}
						giftError={giftError}
						setGiftError={setGiftError}
						type={tipGift ? "tipInGift" : undefined}
					/>
					<ErrorText error={getFieldError("tipInGift")} />
				</>
			) : null}
			{/* Tip Methods */}
			<PaymentMethodChips
				methods={paymentMethods}
				selectedMethods={tipMethods}
				onSelect={onSelectTipMethod}
				disableGift={compInGift === "" || !!tipInGift}
			/>
		</View>
	);
}
