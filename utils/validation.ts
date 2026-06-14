import { z } from "zod";
import { TAX_RATE } from "@/components/Form/constants";

/* --------------------------------- Helpers -------------------------------- */
const parseNum = (val: string | undefined): number =>
	val ? Number.parseFloat(val) : 0;

/** Required numeric string field (must be >= 0) */
const requiredNonNegativeNumericString = (fieldName: string) =>
	z
		.string()
		.min(1, `${fieldName} is required`)
		.refine(
			(val) => !Number.isNaN(parseNum(val)),
			`${fieldName} must be a number`,
		)
		.refine((val) => parseNum(val) >= 0, `${fieldName} must be filled`);

/** Optional numeric string field (must be >= 0 if provided) */
const optionalNonNegativeNumericString = (fieldName: string) =>
	z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(parseNum(val)),
			`${fieldName} must be a number`,
		)
		.refine((val) => !val || parseNum(val) >= 0, `${fieldName} must be filled`);

/* --------------------------------- Schema --------------------------------- */
export const EarningFormSchema = z
	.object({
		compensation: requiredNonNegativeNumericString("Compensation"),
		compensationMethods: z.array(z.enum(["Cash", "Card", "Gift Card"])),
		compInCash: optionalNonNegativeNumericString("Cash amount"),
		compInGift: optionalNonNegativeNumericString("Gift amount"),
		giftCode: z.string().optional(),

		tip: requiredNonNegativeNumericString("Tip"),
		tipMethods: z.array(z.enum(["Cash", "Card", "Gift Card"])),
		tipInCash: optionalNonNegativeNumericString("Tip cash amount"),
		tipInGift: optionalNonNegativeNumericString("Tip gift amount"),

		discount: optionalNonNegativeNumericString("Discount"),
		discountType: z.enum(["Amount", "Percent"]).optional(),
		supply: optionalNonNegativeNumericString("Supply cost"),

		services: z.array(z.string()).optional(),
		serviceDate: z.number().positive("Service date is required"),
		technicianId: z.string().min(1, "Technician is required"),
		clientId: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const compensation = parseNum(data.compensation);
		const discount = parseNum(data.discount);
		const supply = parseNum(data.supply);
		const netCompensation = Math.max(
			0,
			(compensation + supply) * TAX_RATE -
				(data.discountType === "Amount"
					? discount
					: (discount / 100) * compensation),
		);
		const compInCash = parseNum(data.compInCash);
		const compInGift = parseNum(data.compInGift);

		// Check compInCash first
		if (
			data.compInCash &&
			compInCash >= netCompensation &&
			netCompensation > 0
		) {
			ctx.addIssue({
				code: "custom",
				message: "Cash amount must be smaller than compensation after discount",
				path: ["compInCash"],
			});
		} else if (compInCash + compInGift > netCompensation) {
			// Only check total if compInCash is valid
			ctx.addIssue({
				code: "custom",
				message:
					"Total cash and gift card amount must not exceed compensation after discount",
				path: ["compInGift"],
			});
		}

		const tip = parseNum(data.tip);
		const tipInCash = parseNum(data.tipInCash);
		const tipInGift = parseNum(data.tipInGift);

		// Check tipInCash first
		if (data.tipInCash && tipInCash >= tip) {
			ctx.addIssue({
				code: "custom",
				message: "Tip cash amount must be smaller than tip",
				path: ["tipInCash"],
			});
		} else if (tipInCash + tipInGift > tip) {
			// Only check total if tipInCash is valid
			ctx.addIssue({
				code: "custom",
				message: "Total tip cash and gift card amount must not exceed tip",
				path: ["tipInGift"],
			});
		}
	});

export type EarningFormValidation = z.infer<typeof EarningFormSchema>;
