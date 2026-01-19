import type { DataModel, Id } from "@/convex/_generated/dataModel";

type ReplaceType<T, Keys extends keyof T, NewType> = {
	[K in keyof T]: K extends Keys ? NewType : T[K];
};

export type Transaction = ReplaceType<
	DataModel["transactions"]["document"],
	"client" | "technician" | "services",
	string | undefined
>;

export type User = DataModel["users"]["document"] & {
	tip: number;
	compensation: number;
};

export type Technician = DataModel["users"]["document"];

export type Category = DataModel["categories"]["document"];

export type PaymentMethod = "Cash" | "Card" | "Gift Card";

export type EarningFormState = {
	compensation: string;
	compensationMethods: PaymentMethod[];
	tip: string;
	tipMethods: PaymentMethod[];
	technicianId: Id<"users">;
	services: Id<"categories">[];
	serviceDate: number;
	gift?: string;
	giftCode?: string;
	discount?: string;
	clientId?: Id<"users">;
};

export type Gift = DataModel["giftCards"]["document"];
