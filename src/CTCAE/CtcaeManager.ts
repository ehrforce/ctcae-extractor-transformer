import { CodedItem } from 'ehrcraft-form-api';

const SocTerm = "SocTerm";
const SocTermName = "SocTermName";
const SocGroup = "SocGroup";
const SocName = "SocName";
const CTCAE_VERSION = "CTCAE_5.0";

const accept_no_adverse_reaction = true;
const no_adverse_reaction_label = "0-Absence of an adverse event or within normal limits";
export class CTCAEManager {


    constructor(private CtcaeGrades: DipsCode[], private CtcaeCategories: DipsCode[], private CtcaeTerms: DipsCode[]) {

    }

    public getGradesAsCodedItem(soc?: string, term?: string): CodedItem[] {
        const arr: CodedItem[] = [];
        for (const g of this.getGrades(soc, term)) {
            const ord = g.code.substring(0, 1);
            arr.push(new CodedItem(g.code, `${ord}-${g.name}` as string, g.name, g.codelist));
        }
        if (accept_no_adverse_reaction) {
            arr.push(new CodedItem(`0-${term}`, no_adverse_reaction_label, no_adverse_reaction_label, 'CTCAETERM'));
        }
        return arr;

    }
    public getCategoriesAsCodedItem(): CodedItem[] {
        const arr: CodedItem[] = [];
        for (const c of this.CtcaeCategories) {
            arr.push(new CodedItem(c.code, c.name, c.name, c.codelist));
        }
        return arr;

    }
    public getCategoryOfCode(code: string): DipsCode | undefined {
        const res = this.CtcaeCategories.filter(x => x.code === code);
        if (res && res.length === 1) {
            return res[0];
        }
        this.emit(`No category found with code: ${code}`, "CATEGORY");
        return undefined;

    }
    public getTermsAsCodedItem(soc?: string): CodedItem[] {
        const arr: CodedItem[] = [];
        for (const g of this.getTerms(soc)) {
            arr.push(new CodedItem(g.code, g.name, g.name, g.codelist));
        }
        return arr;
    }
    public getTerms(soc?: string): DipsCode[] {
        if (soc) {
            return this.filterByParameter(SocGroup, soc, this.CtcaeTerms);
        }
        return this.CtcaeTerms;
    }
    public getTerm(code: string): DipsCode | undefined {
        const arr = this.CtcaeTerms.filter(x => x.code === code);
        if (arr && arr.length === 1) {
            return arr[0];
        }
        return undefined;

    }
    public getGrades(soc?: string, term?: string): DipsCode[] {
        if (soc && term) {
            return this.filterBySocAndTerm(soc, term, this.CtcaeGrades);
        }
        if (soc) {
            return this.filterByParameter(SocGroup, soc, this.CtcaeGrades);
        }
        if (term) {
            return this.filterByParameter(SocTerm, term, this.CtcaeGrades);
        }
        return this.CtcaeGrades;
    }
    private filterByParameter(parameter: string, value: string, codes: DipsCode[]) {
        return codes.filter(x => this.hasParameter(parameter, value, x));
    }

    private filterBySocAndTerm(soc: string, term: string, codes: DipsCode[]) {
        return codes.filter(x => {
            return this.hasParameter(SocGroup, soc, x) && this.hasParameter(SocTerm, term, x);
        })

    }
    private hasParameter(parameter: string, value: string, c: DipsCode) {
        return c.parameters.filter(x => x.Name === parameter && x.Value === value).length > 0;
    }

    private emit(s: string, attr = "") {
        console.log(`|-- db2.api ${attr}: ${s}`);
    }

}

/**
 * Defines the simplified CTCAE model to be used in the
 */
export type CTCAE_MODEL = {
    code: number;
    category: string;
    term: string;
    g1: string;
    g2: string;
    g3: string;
    g4: string;
    g5: string;
    definition: string;
    change: string;
};

/**
 * Defines the columns in the Excel spreadshett 
 */
export type CTCAE_ROW = {
    "MedDRA Code": number;
    "MedDRA SOC": string;
    "CTCAE Term": string;
    "Grade 1   ": string;
    "Grade 2   ": string;
    "Grade 3   ": string;
    "Grade 4   ": string;
    "Grade 5   ": string;
    "Definition": string;
    "CTCAE v5.0 Change": string;
};

export type CTCAE_DATABASE = {
    categories: CTCAE_CATEGORY[];
    models: CTCAE_MODEL[];
};
export type CTCAE_CATEGORY = {
    id: number;
    name: string;
};

type TERM_DOC_DEF = {
    id: string,
    desc: string
}
export const TERMINOLOGY_IDENTIFIERS: Record<string, TERM_DOC_DEF> = {
    MEDRA: { id: "http://terminology.hl7.org/CodeSystem/mdr", desc: "https://terminology.hl7.org/CodeSystem-mdr.html" },
    CTCAE_GRADE: { id: "CTCAETERM", desc: "https://discourse.openehr.org/t/ctcae-and-external-resources/3772/7" }
}


export interface DipsCode {
    codelist: string;
    code: string;
    name: string;
    parameters: DipsCodeSetParameter[];
}
export type DipsCodeSetParameter = {
    Name: string;
    Value: string;
};

export function getParameterValue(name: string, c: DipsCode): string | undefined {
    const p = c.parameters.filter(x => x.Name === name);
    if (!p || p.length <= 0) {
        return undefined;
    }
    return p[0].Value;


}

