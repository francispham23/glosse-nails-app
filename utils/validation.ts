import { z } from "zod";

/* --------------------------------- Helpers -------------------------------- */
const parseNum = (val: string | undefined): number =>
	val ? Number.parseFloat(val) : 0;

/** Required numeric string field (must be > 0) */
const requiredPositiveNumericString = (fieldName: string) =>
	z
		.string()
		.min(1, `${fieldName} is required`)
		.refine(
			(val) => !Number.isNaN(parseNum(val)),
			`${fieldName} must be a number`,
		)
		.refine((val) => parseNum(val) > 0, `${fieldName} must be greater than 0`);

/** Required numeric string field (must be >= 0) */
const requiredNonNegativeNumericString = (fieldName: string) =>
	z
		.string()
		.min(1, `${fieldName} is required`)
		.refine(
			(val) => !Number.isNaN(parseNum(val)),
			`${fieldName} must be a number`,
		)
		.refine((val) => parseNum(val) >= 0, `${fieldName} must be non-negative`);

/** Optional numeric string field (must be >= 0 if provided) */
const optionalPositiveNumericString = (fieldName: string) =>
	z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(parseNum(val)),
			`${fieldName} must be a number`,
		)
		.refine(
			(val) => !val || parseNum(val) >= 0,
			`${fieldName} must be positive`,
		);

/* --------------------------------- Schema --------------------------------- */
export const EarningFormSchema = z
	.object({
		compensation: requiredPositiveNumericString("Compensation"),
		compensationMethods: z.array(z.enum(["Cash", "Card", "Gift Card"])),
		compInCash: optionalPositiveNumericString("Cash amount"),
		compInGift: optionalPositiveNumericString("Gift amount"),
		giftCode: z.string().optional(),

		tip: requiredNonNegativeNumericString("Tip"),
		tipMethods: z.array(z.enum(["Cash", "Card", "Gift Card"])),
		tipInCash: optionalPositiveNumericString("Tip cash amount"),
		tipInGift: optionalPositiveNumericString("Tip gift amount"),

		discount: optionalPositiveNumericString("Discount"),
		supply: optionalPositiveNumericString("Supply cost"),

		services: z.array(z.string()).optional(),
		serviceDate: z.number().positive("Service date is required"),
		technicianId: z.string().min(1, "Technician is required"),
		clientId: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const compensation = parseNum(data.compensation);
		const compInCash = parseNum(data.compInCash);
		const compInGift = parseNum(data.compInGift);

		// Check compInCash first
		if (data.compInCash && compInCash >= compensation) {
			ctx.addIssue({
				code: "custom",
				message: "Cash amount must be smaller than compensation",
				path: ["compInCash"],
			});
		} else if (compInCash + compInGift > compensation) {
			// Only check total if compInCash is valid
			ctx.addIssue({
				code: "custom",
				message: "Total cash and gift card amount must not exceed compensation",
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
