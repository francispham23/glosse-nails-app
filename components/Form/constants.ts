import type { Category, PaymentMethod } from "@/utils/types";

/* ---------------------------- earning form state --------------------------- */
export const paymentMethods = ["Card", "Cash", "Gift Card"] as PaymentMethod[];

export const initialEarningState = {
	compensation: "",
	compInCash: "",
	compInGift: "",
	compensationMethods: ["Card"] as PaymentMethod[],
	tip: "0",
	tipInCash: "",
	tipInGift: "",
	tipMethods: ["Card"] as PaymentMethod[],
	discount: "",
	supply: "",
	giftCode: "",
	services: [] as Category["_id"][],
};

/* --------------------------- other inputs --------------------------- */
export const otherInputs = ["Supply", "Discount"];
