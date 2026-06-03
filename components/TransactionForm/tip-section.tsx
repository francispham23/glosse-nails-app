import { View } from "react-native";

import { paymentMethods } from "@/components/Form/constants";
import { ErrorText } from "@/components/Form/form";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import { NumericInput } from "@/components/Form/numeric-input";
import { PaymentMethodChips } from "@/components/TransactionForm/form-chips";

import type { EarningFormState, Gift, PaymentMethod } from "@/utils";

interface TipSectionProps {
	tip: EarningFormState["tip"];
	tipInCash: EarningFormState["tipInCash"];
	tipInGift: EarningFormState["tipInGift"];
	compInGift: EarningFormState["compInGift"];
	tipCash: boolean;
	tipCard: boolean;
	tipGift: boolean;
	tipMethods: EarningFormState["tipMethods"];
	tipPlaceholder: string;
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
	onSelectTipMethod: (method: PaymentMethod) => void;
}

export function TipSection({
	tip,
	tipInCash,
	tipInGift,
	compInGift,
	tipCash,
	tipCard,
	tipGift,
	tipMethods,
	tipPlaceholder,
	mutedColor,
	earning,
	updateEarning,
	giftCard,
	giftError,
	setGiftError,
	getFieldError,
	onSelectTipMethod,
}: TipSectionProps) {
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
