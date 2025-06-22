
import * as fs from "node:fs";
import { DvCodedText, DvCodePhrase } from "ehrcraft-form-api";
import {  CTCAEManager } from "../CTCAE/CtcaeManager";
import { CTCAE_DATABASE } from "../CTCAE/model";

describe("Test can load categories", () => {
	const categories = fs.readFileSync("output/categories.json", {
		encoding: "utf-8",
	});
	const db = JSON.parse(categories) as CTCAE_DATABASE;
	const manager = new CTCAEManager(db);

	test("Kategori har term MEDRA", ()=>{
		const categories= manager.getCategories();
		expect(categories).toBeDefined();
		expect(categories.length).toBeGreaterThan(0);	
		categories.forEach(x =>{
			expect(x.terminology).toBe("MEDRA");
		})

	})
	test("Term har term MEDRA", ()=>{
		const terms = manager.getTerms();
		expect(terms).toBeDefined();
		expect(terms.length).toBeGreaterThan(0);
		terms.forEach(x =>{
			expect(x.terminology).toBe("MEDRA");
		})
	});
	
	test("Grade klassifisering har term CTCAETERM", ()=>{
		const grades = manager.getGrades();
		expect(grades).toBeDefined();
		expect(grades.length).toBeGreaterThan(0);
		grades.forEach(x =>{
			expect(x.terminology).toBe("CTCAETERM");
		})
	})
	test("Categories exists", () => {
		const cats = manager.getCategories();
		expect(cats).toBeDefined();
		expect(cats.length).toBeGreaterThan(0);
	});
	test("Ear 10013993", () => {
		const id = 10013993;
		const name = "Ear and labyrinth disorders";
		const item = manager.getCategories().find((x) => x.code === id.toString());
		expect(item).toBeDefined();
		expect(item?.name).toBe(name);

		const ear1 = `1-${id}`;
		const grade1 = manager.getGrades().find((x) => x.code === ear1);
		expect(grade1).toBeDefined();
		expect(grade1?.name).toBe(
			"1 Asymptomatic or mild symptoms; clinical or diagnostic observations only; intervention not indicated",
		);
		const ear5 = `5-${id}`;
		const grade5 = manager.getGrades().find((x) => x.code === ear5);
		expect(grade5).toBeDefined();
		expect(grade5?.name).toBe("5 Death");

	});
	test("Ear get grading", ()=>{
		const id = 10013993;
		const name = "Ear and labyrinth disorders - Other, specify";
		const t = toDvCodedText(name, id.toString());
		const grades = manager.getGradesByTerm(t);
		expect(grades).toBeDefined();
		expect(grades.length).toBeGreaterThan(0);

		const i1 = grades.find(x=>x.code === "1-10013993");
		expect(i1).toBeDefined();
		expect(i1?.name).toBe("1 Asymptomatic or mild symptoms; clinical or diagnostic observations only; intervention not indicated");

		const i2 = grades.find(x=>x.code === "2-10013993");
		expect(i2).toBeDefined();
		expect(i2?.name).toBe("2 Moderate; minimal, local or noninvasive intervention indicated; limiting age-appropriate instrumental ADL");


		const i3 = grades.find(x=>x.code === "3-10013993");
		expect(i3).toBeDefined();
		expect(i3?.name).toBe("3 Severe or medically significant but not immediately life-threatening; hospitalization or prolongation of existing hospitalization indicated; limiting self care ADL");


		const i4 = grades.find(x=>x.code === "4-10013993");
		expect(i4).toBeDefined();
		expect(i4?.name).toBe("4 Life-threatening consequences; urgent intervention indicated");


		const i5 = grades.find(x=>x.code === "5-10013993");
		expect(i5).toBeDefined();
		expect(i5?.name).toBe("5 Death");

		

	});

});

describe("Test API features", () => { });

function toDvCodedText(value: string, code: string, term: string = "MEDRA") {
	const t = new DvCodedText();
	t.value = value;
	const p = new DvCodePhrase();
	p.codeString = code;
	p.terminologyId = {
		value: term,
	};
	t.definingCode = p;
	return t;
}
