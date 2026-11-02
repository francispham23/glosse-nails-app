import { expect, jest, test } from "@jest/globals";
import { tryDismissModalRoute } from "../utils/modal-route-dismiss";

test("tryDismissModalRoute calls back when allowed", () => {
	const back = jest.fn();
	tryDismissModalRoute(false, () => true, back);
	expect(back).toHaveBeenCalledTimes(1);
});

test("tryDismissModalRoute skips when locked", () => {
	const back = jest.fn();
	tryDismissModalRoute(true, () => true, back);
	expect(back).not.toHaveBeenCalled();
});

test("tryDismissModalRoute skips when history is empty", () => {
	const back = jest.fn();
	tryDismissModalRoute(false, () => false, back);
	expect(back).not.toHaveBeenCalled();
});
