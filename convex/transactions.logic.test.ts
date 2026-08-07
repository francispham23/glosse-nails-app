import { describe, it, expect } from "vitest";
import { prepareTransactionData } from "./lib/transforms";

describe("prepareTransactionData", () => {
	it("parses money strings to numbers rounded to 2 decimals", () => {
		const result = prepareTransactionData({
			compensation: "100",
			compensationMethods: ["Cash"],
			tip: "20",
			tipMethods: ["Card"],
			technicianId: "users/123" as any,
			serviceDate: 1700000000000,
		});

		expect(result.compensation).toBe(100);
		expect(result.tip).toBe(20);
		expect(result.technician).toBe("users/123");
		expect(result.serviceDate).toBe(1700000000000);
		// Optional fields omitted when not provided
		expect(result.compInCash).toBeUndefined();
		expect(result.discount).toBeUndefined();
		expect(result.supply).toBeUndefined();
	});

	it("rounds to 2 decimals (banker-unfriendly but matches app behavior)", () => {
		const result = prepareTransactionData({
			compensation: "100.456",
			compensationMethods: ["Cash"],
			tip: "20.789",
			tipMethods: ["Card"],
			technicianId: "users/123" as any,
			serviceDate: 1700000000000,
		});

		expect(result.compensation).toBe(100.46);
		expect(result.tip).toBe(20.79);
	});

	it("maps optional string fields to numbers, undefined when blank", () => {
		const result = prepareTransactionData({
			compensation: "100",
			compensationMethods: ["Cash"],
			tip: "20",
			tipMethods: ["Card"],
			technicianId: "users/123" as any,
			serviceDate: 1700000000000,
			compInCash: "30",
			compInGift: "10",
			tipInCash: "5",
			tipInGift: "2",
			discount: "15",
			supply: "8",
			giftCode: "giftCards/abc" as any,
		});

		expect(result.compInCash).toBe(30);
		expect(result.compInGift).toBe(10);
		expect(result.tipInCash).toBe(5);
		expect(result.tipInGift).toBe(2);
		expect(result.discount).toBe(15);
		expect(result.supply).toBe(8);
		expect(result.giftCode).toBe("giftCards/abc");
	});

	it("strips discount/type and keeps them in sync", () => {
		const withDiscount = prepareTransactionData({
			compensation: "100",
			compensationMethods: ["Cash"],
			tip: "20",
			tipMethods: ["Card"],
			technicianId: "users/123" as any,
			serviceDate: 1700000000000,
			discount: "15",
			discountType: "Percent",
		});
		expect(withDiscount.discount).toBe(15);
		expect(withDiscount.discountType).toBe("Percent");

		const noDiscount = prepareTransactionData({
			compensation: "100",
			compensationMethods: ["Cash"],
			tip: "20",
			tipMethods: ["Card"],
			technicianId: "users/123" as any,
			serviceDate: 1700000000000,
		});
		expect(noDiscount.discount).toBeUndefined();
		expect(noDiscount.discountType).toBeUndefined();
	});
});
