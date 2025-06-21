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
type TERM_DOC_DEF = {
    id: string,
    desc: string
}
 const TERMINOLOGY_IDENTIFIERS: Record<string, TERM_DOC_DEF> = {
    MEDRA: { id: "http://terminology.hl7.org/CodeSystem/mdr", desc: "https://terminology.hl7.org/CodeSystem-mdr.html" },
    CTCAE_GRADE: { id: "CTCAETERM", desc: "https://discourse.openehr.org/t/ctcae-and-external-resources/3772/7" }
}
interface DipsCode {
    codelist: string;
    code: string;
    name: string;
    parameters: DipsCodeSetParameter[];
}
type DipsCodeSetParameter = {
    Name: string;
    Value: string;
};

function getParameterValue(name: string, c: DipsCode): string | undefined {
    const p = c.parameters.filter(x => x.Name === name);
    if (!p || p.length <= 0) {
        return undefined;
    }
    return p[0].Value;


}
