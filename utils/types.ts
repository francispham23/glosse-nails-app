import type { DataModel } from "@/convex/_generated/dataModel";

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

export type Category = DataModel["categories"]["document"];
