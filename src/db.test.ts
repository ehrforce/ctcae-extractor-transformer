import * as fs from "node:fs";
import type { CTCAE_DATABASE } from "./CTCAE/CtcaeManager";

describe("Test can load categories", () => {
	const categories = fs.readFileSync("output/categories.json", {
		encoding: "utf-8",
	});
	const db = JSON.parse(categories) as CTCAE_DATABASE;
	test("Categories exsist", () => {
		expect(categories).toBeDefined();
	});
	test("Ear", () => {
		const id = 10013993;
		const name = "Ear and labyrinth disorders";
		const item = db.categories.find((x) => x.id === id);
		expect(item).toBeDefined();
		expect(item?.name).toBe(name);
	});
});
