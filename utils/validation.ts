import { z } from "zod";

export const EarningFormSchema = z.object({
	compensation: z
		.string()
		.refine((val) => val.trim() !== "", "Compensation is required")
		.refine(
			(val) => !Number.isNaN(Number.parseFloat(val)),
			"Compensation must be a number",
		)
		.refine(
			(val) => Number.parseFloat(val) > 0,
			"Compensation must be greater than 0",
		),

	compensationMethods: z
		.array(z.enum(["Cash", "Card", "Gift Card"]))
		.min(1, "Select at least one compensation method"),

	compInCash: z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(Number.parseFloat(val)),
			"Cash amount must be a number",
		)
		.refine(
			(val) => !val || Number.parseFloat(val) >= 0,
			"Cash amount must be positive",
		),

	compInGift: z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(Number.parseFloat(val)),
			"Gift amount must be a number",
		)
		.refine(
			(val) => !val || Number.parseFloat(val) >= 0,
			"Gift amount must be positive",
		),

	giftCode: z.string().optional(),

	tip: z
		.string()
		.refine((val) => val.trim() !== "", "Tip is required")
		.refine(
			(val) => !Number.isNaN(Number.parseFloat(val)),
			"Tip must be a number",
		)
		.refine((val) => Number.parseFloat(val) >= 0, "Tip must be non-negative"),

	tipMethods: z
		.array(z.enum(["Cash", "Card", "Gift Card"]))
		.min(1, "Select at least one tip method"),

	tipInCash: z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(Number.parseFloat(val)),
			"Tip cash amount must be a number",
		)
		.refine(
			(val) => !val || Number.parseFloat(val) >= 0,
			"Tip cash amount must be positive",
		),

	tipInGift: z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(Number.parseFloat(val)),
			"Tip gift amount must be a number",
		)
		.refine(
			(val) => !val || Number.parseFloat(val) >= 0,
			"Tip gift amount must be positive",
		),

	discount: z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(Number.parseFloat(val)),
			"Discount must be a number",
		)
		.refine(
			(val) => !val || Number.parseFloat(val) >= 0,
			"Discount must be positive",
		),

	supply: z
		.string()
		.optional()
		.refine(
			(val) => !val || !Number.isNaN(Number.parseFloat(val)),
			"Supply cost must be a number",
		)
		.refine(
			(val) => !val || Number.parseFloat(val) >= 0,
			"Supply cost must be positive",
		),

	services: z.array(z.string()).optional(),

	serviceDate: z.number().refine((val) => val > 0, "Service date is required"),

	technicianId: z.string(),
	clientId: z.string().optional(),
});

export type EarningFormValidation = z.infer<typeof EarningFormSchema>;
