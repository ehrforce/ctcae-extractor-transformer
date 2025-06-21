import { API, DvCodedText, DvOrdinal, DvText } from "ehrcraft-form-api";

import { CTCAEManager } from "./CtcaeManager";

import { CTCAE_FIELDS } from "./model";


 const CTCAE_VERSION = "CTCAE_5.0";



/**
 * Listener for CTCAE 
 * @param api 
 * @param fields 
 * @param manager 
 */
export function addListenersCtcae(api: API, fields: CTCAE_FIELDS, manager: CTCAEManager) {

    api.addListener(fields.category, "OnFormInitialized", (id, value, parent) =>{
        const category = api.getFieldValue(fields.category, parent) as DvCodedText | null;
        const term = api.getFieldValue(fields.term, parent) as DvCodedText | null;
        const grade = api.getFieldValue(fields.grade_classification, parent) as DvCodedText | null;

        api.setCodeListItems(fields.category, manager.getCategories(), parent);
        api.setFieldValue(fields.category, category, parent);

        api.setCodeListItems(fields.term, manager.getTermsByCategory(category == null ? undefined : category ) , parent  );
        
    });

    api.addListener(fields.ctcae_cluster, "OnChildAdded", (id, value, parent) => {
        console.log("A new CTCAE cluster was added");
        api.setCodeListItems(fields.category, manager.getCategories(), value);
        api.setCodeListItems(fields.term, manager.getTerms(), value);
        api.setCodeListItems(fields.grade_classification, manager.getGrades(), value);
        api.setFieldValue(fields.ctcae_version, getCtcaeVersionAsDvText(), value);
    });

    api.addListener(fields.category, "OnChanged", (id, value, parent) => {
        const t = value as DvCodedText | null;
        const terms = manager.getTermsByCategory(t == null ? undefined : t);
        const grades = manager.getGradesByCategory(t == null ? undefined : t);

        api.clearField(fields.term, parent);
        api.setCodeListItems(fields.term, terms, parent);

        api.clearField(fields.grade_classification, parent);
        api.setCodeListItems(fields.grade_classification, grades, parent);

    });

    api.addListener(fields.term, "OnChanged", (id, value, parent) => {
        const t = value as DvCodedText | null;
        const gradings = manager.getGradingsByTerm(t == null ? undefined : t);
        api.clearField(fields.grade_classification, parent);
        api.setCodeListItems(fields.grade_classification, gradings, parent);
    });

    api.addListener(fields.grade_classification, "OnChanged", (id, value, parent) => {

        const t = value as DvCodedText | null;
        if (t?.definingCode.codeString != undefined) {
            const ordinal = getOrdinal(t.definingCode.codeString.substring(0, 1));
            api.setFieldValue(fields.grade_ordinal, ordinal, parent);
            //api.setFieldValue(fields.ctcae_version);)
            api.setFieldValue(fields.ctcae_version, getCtcaeVersionAsDvText(), parent);
        } else {
            api.clearField(fields.grade_ordinal, parent);
            api.clearField(fields.ctcae_version, parent);
        }

        handleHighestGrade(api);

    });


    /**
     * Grade 1 Mild; asymptomatic or mild symptoms; clinical or diagnostic observations only; intervention not indicated.
     * Grade 2 Moderate; minimal, local or noninvasive intervention indicated; limiting ageappropriate instrumental ADL*.
     * Grade 3 Severe or medically significant but not immediately life-threatening;hospitalization or prolongation of hospitalization indicated; disabling; limiting self care ADL**.
     * Grade 4 Life-threatening consequences; urgent intervention indicated.
     * Grade 5 Death related to AE.
     * @param api 
     */
    function handleHighestGrade(api: API) {

        if (fields.alvorlighetsgrad) {
            const grades = api.getFields(fields.grade_ordinal) as DvOrdinal[] | null;
            let highest = 0;
            if (grades) {
                for (const g of grades) {
                    if (g?.value) {
                        if (g.value > highest) {
                            highest = g.value;
                        }
                    }
                }
            }
            const codedString = getCodeString(highest);
            if (codedString) {
                const t = DvCodedText.Parse(codedString);
                api.setFieldValue(fields.alvorlighetsgrad, t);
            } else {
                api.clearField(fields.alvorlighetsgrad);
            }

            console.log("|-- highest grade = " + highest);
        }
        function getCodeString(n: number): string | undefined {
            switch (n) {
                case 0:
                case 1:
                    return "local::at0047|Mild|";
                case 2:
                    return "local::at0048|Moderat|";
                case 3:
                case 4:
                case 5:
                    return "local::at0049|Alvorlig|";
                default:
                    return undefined;
            }
        }
    }

    function getOrdinal(n: string): DvOrdinal | undefined {
        const ordinalValue = getOrdinalNumber(n);
        if (ordinalValue) {
            return DvOrdinal.Parse(ordinalValue);
        } else {
            return undefined;
        }


        function getOrdinalNumber(n: string): string | undefined {
            switch (n) {
                case "0":
                    return "0|local::at0021|Grad 0|";
                case "1":
                    return "1|local::at0015|Grad 1|";

                case "2":
                    return "2|local::at0016|Grad 2|";
                case "3":
                    return "3|local::at0017|Grad 3|";

                case "4":
                    return "4|local::at0018|Grad 4|";
                case "5":
                    return "5|local::at0019|Grad 5|";
                default:
                    console.warn("Unsupported ordinal number for " + n);
                    return undefined;

            }

        }

    }
    function getCtcaeVersionAsDvText(): DvText {
        const t = new DvText();
        t.value = CTCAE_VERSION;
        return t;
    }
    

}


