import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateSchema } from "./use-form-validation";

const SampleSchema = z.object({
	compensation: z.string().min(1, "Compensation is required"),
	tip: z.string().min(1, "Tip is required"),
	technicianId: z.string().min(1, "Technician is required"),
});

describe("validateSchema", () => {
	it("returns success with empty errors for valid data", () => {
		const result = validateSchema(SampleSchema, {
			compensation: "100",
			tip: "20",
			technicianId: "users/1",
		});
		expect(result.success).toBe(true);
		expect(result.errors).toEqual({});
	});

	it("maps zod issues to a field-keyed error object", () => {
		const result = validateSchema(SampleSchema, {
			compensation: "",
			tip: "",
			technicianId: "",
		});
		expect(result.success).toBe(false);
		expect(result.errors.compensation).toBe("Compensation is required");
		expect(result.errors.tip).toBe("Tip is required");
		expect(result.errors.technicianId).toBe("Technician is required");
	});

	it("joins nested paths with dots (mirrors the hook's getFieldError contract)", () => {
		const NestedSchema = z.object({
			inner: z.object({ field: z.string().min(1, "Inner required") }),
		});
		const result = validateSchema(NestedSchema, { inner: { field: "" } });
		expect(result.success).toBe(false);
		expect(result.errors["inner.field"]).toBe("Inner required");
	});

	it("does not throw on non-ZodError exceptions (returns failure, no crash)", () => {
		// A schema whose parse throws a non-ZodError still yields a safe failure.
		const BoomSchema = z.custom(() => {
			throw new Error("boom");
		});
		const result = validateSchema(BoomSchema, "x");
		expect(result.success).toBe(false);
	});
});
