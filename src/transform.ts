import * as fs from "node:fs";
import type { CTCAE_MODEL, CTCAE_ROW } from "./CTCAE/CtcaeManager";
import type { OutputFileDefinitions } from "./main";
import { type GroupDef, SocGroupToRecord, soc_groups } from "./soc_groups";

const TERM_CTCAE = "CTCAE";
const TERM_CTCAE_GROUP = "CTCAE-GROUP";

type CategoriesAndTerminologies = {
	categories: string[];
	terms: string[];
};

export async function loadMapAndWriteTerms(
	json: string,
	outfileOptions: OutputFileDefinitions,
): Promise<boolean> {
	const categoriesAndModels = fillModelsAndCategoriesFromJsonData(json);
	const result = createTermString(
		categoriesAndModels.categories,
		categoriesAndModels.models,
	);
	fs.writeFileSync(
		outfileOptions.categoriesTermTextOUtfile,
		result.categories.join("\n"),
		{ encoding: "utf-8" },
	);
	fs.writeFileSync(
		outfileOptions.termsTermTextOUtfile,
		result.terms.join("\n"),
		{ encoding: "utf-8" },
	);
	return true;
}

export function fillModelsAndCategoriesFromJsonData(excelJson: string) {
	const models: CTCAE_MODEL[] = [];

	const importedTerms: CTCAE_ROW[] = JSON.parse(excelJson);
	importedTerms.forEach((excelRow) => {
		const model = transformFromExcelModelToSimplifiedModel(excelRow);
		const medraCodeSoc = findMedraCodeForSocTerm(model.category);
		if (!medraCodeSoc) {
			throw new Error(`No SOC found for model: ${JSON.stringify(model)}`);
		}

		models.push(model);
	});
	return { categories: SocGroupToRecord(), models: models };
}

function findMedraCodeForSocTerm(s: string): GroupDef | undefined {
	const items = soc_groups.filter((x) => x.name === s);
	if (items && items.length === 1) {
		return items[0];
	} else {
		return undefined;
	}
}

/**
 * Transform Excel model into domain model
 * @param c Excel based model
 * @returns Simplified model
 */
function transformFromExcelModelToSimplifiedModel(c: CTCAE_ROW): CTCAE_MODEL {
	return {
		code: c["MedDRA Code"],
		category: c["MedDRA SOC"],
		term: c["CTCAE Term"],
		g1: c["Grade 1   "],
		g2: c["Grade 2   "],
		g3: c["Grade 3   "],
		g4: c["Grade 4   "],
		g5: c["Grade 5   "],
		definition: c.Definition,
		change: c["CTCAE v5.0 Change"],
	};
}

/**
 * @param categories
 * @param models
 * @returns
 */
function createTermString(
	categories: Record<string, number>,
	models: CTCAE_MODEL[],
): CategoriesAndTerminologies {
	let categoryNumber = 1000;
	const termCategory: string[] = [];
	const terms: string[] = [];
	Object.keys(categories).forEach((category) => {
		categoryNumber++;
		const currentTermCategory = `${TERM_CTCAE_GROUP}::${categoryNumber}::${category}`;

		termCategory.push(currentTermCategory);

		models
			.filter((model) => model.category === category)
			.forEach((model) => {
				const currentTerm = `${TERM_CTCAE}::${model.code}::${model.term}`;
				terms.push(currentTerm);
			});
	});
	return { categories: termCategory, terms: terms };
}
