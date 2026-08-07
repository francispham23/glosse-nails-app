import { describe, it, expect } from "vitest";
import { EarningFormSchema } from "./validation";

const validBase = {
	compensation: "100",
	compensationMethods: ["Cash", "Card"] as const,
	compInCash: "",
	compInGift: "",
	giftCode: "",
	tip: "20",
	tipMethods: ["Card"] as const,
	tipInCash: "",
	tipInGift: "",
	discount: "",
	discountType: undefined,
	supply: "",
	services: [],
	serviceDate: 1700000000000,
	technicianId: "tech_123",
	clientId: undefined,
};

describe("EarningFormSchema — required & numeric", () => {
	it("accepts a valid payload", () => {
		expect(() => EarningFormSchema.parse(validBase)).not.toThrow();
	});

	it("rejects empty compensation", () => {
		const r = EarningFormSchema.safeParse({ ...validBase, compensation: "" });
		expect(r.success).toBe(false);
	});

	it("rejects non-numeric compensation", () => {
		const r = EarningFormSchema.safeParse({ ...validBase, compensation: "abc" });
		expect(r.success).toBe(false);
	});

	it("rejects negative compensation", () => {
		const r = EarningFormSchema.safeParse({ ...validBase, compensation: "-5" });
		expect(r.success).toBe(false);
	});

	it("requires a technicianId", () => {
		const r = EarningFormSchema.safeParse({ ...validBase, technicianId: "" });
		expect(r.success).toBe(false);
	});

	it("requires a positive serviceDate", () => {
		const r = EarningFormSchema.safeParse({ ...validBase, serviceDate: 0 });
		expect(r.success).toBe(false);
	});
});

describe("EarningFormSchema — cross-field cash/gift vs net compensation", () => {
	it("rejects cash amount >= net compensation when net > 0", () => {
		// compensation 100 * 1.05 tax = 105 net; cash 105 is not smaller
		const r = EarningFormSchema.safeParse({
			...validBase,
			compensation: "100",
			compInCash: "105",
		});
		expect(r.success).toBe(false);
	});

	it("allows cash amount smaller than net compensation", () => {
		const r = EarningFormSchema.safeParse({
			...validBase,
			compensation: "100",
			compInCash: "50",
		});
		expect(r.success).toBe(true);
	});

	it("rejects total cash+gift exceeding net compensation", () => {
		// net = 105; cash 60 + gift 50 = 110 > 105
		const r = EarningFormSchema.safeParse({
			...validBase,
			compensation: "100",
			compInCash: "60",
			compInGift: "50",
		});
		expect(r.success).toBe(false);
	});

	it("applies discount to net compensation", () => {
		// compensation 100, discount 10 (Amount) -> net = (100 + 0)*1.05 - 10 = 95
		// cash 95 is not smaller than 95 -> rejected
		const r = EarningFormSchema.safeParse({
			...validBase,
			compensation: "100",
			compInCash: "95",
			discount: "10",
			discountType: "Amount",
		});
		expect(r.success).toBe(false);
	});
});

describe("EarningFormSchema — tip validations", () => {
	it("rejects tip cash amount >= tip", () => {
		const r = EarningFormSchema.safeParse({
			...validBase,
			tip: "20",
			tipInCash: "20",
		});
		expect(r.success).toBe(false);
	});

	it("rejects total tip cash+gift exceeding tip", () => {
		const r = EarningFormSchema.safeParse({
			...validBase,
			tip: "20",
			tipInCash: "12",
			tipInGift: "12",
		});
		expect(r.success).toBe(false);
	});

	it("allows tip cash smaller than tip", () => {
		const r = EarningFormSchema.safeParse({
			...validBase,
			tip: "20",
			tipInCash: "10",
		});
		expect(r.success).toBe(true);
	});
});
