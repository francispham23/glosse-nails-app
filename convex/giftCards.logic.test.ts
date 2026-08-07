import { describe, it, expect } from "vitest";
import { computeGiftCardBalance } from "./lib/transforms";

// TAX_RATE is 1.05 (5% tax applied to compInGift + supply redemptions).
const tx = (
	over: { _id?: any; compInGift?: number; supply?: number; tipInGift?: number } = {},
) => ({ _id: "transactions/x" as any, ...over });

describe("computeGiftCardBalance", () => {
	it("returns full value when there are no transactions", () => {
		expect(computeGiftCardBalance(100, [])).toBe(100);
	});

	it("reduces balance by (compInGift + supply) * 1.05 + tipInGift", () => {
		// redeemed = (30 + 10) * 1.05 + 5 = 47; balance = 100 - 47 = 53
		const balance = computeGiftCardBalance(100, [tx({ compInGift: 30, supply: 10, tipInGift: 5 })]);
		expect(balance).toBe(53);
	});

	it("accumulates across multiple transactions", () => {
		// tx1: (20+0)*1.05 + 0 = 21; tx2: (0+5)*1.05 + 3 = 8.25 -> total 29.25
		const balance = computeGiftCardBalance(100, [
			tx({ compInGift: 20, _id: "transactions/1" as any }),
			tx({ supply: 5, tipInGift: 3, _id: "transactions/2" as any }),
		]);
		expect(balance).toBeCloseTo(100 - 29.25, 5);
	});

	it("excludes a transaction by id (used when editing in-progress redemption)", () => {
		const editing = tx({ compInGift: 30, supply: 10, tipInGift: 5, _id: "transactions/edit" as any });
		const other = tx({ compInGift: 5, _id: "transactions/other" as any });
		// Only `other` counts: (5+0)*1.05 + 0 = 5.25; balance = 100 - 5.25 = 94.75
		const balance = computeGiftCardBalance(
			100,
			[editing, other],
			"transactions/edit" as any,
		);
		expect(balance).toBeCloseTo(94.75, 5);
	});

	it("treats blank redemptions as zero", () => {
		expect(computeGiftCardBalance(100, [tx({})])).toBe(100);
	});
});
