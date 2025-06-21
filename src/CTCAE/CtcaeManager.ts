import { CodedItem, DvCodedText } from 'ehrcraft-form-api';
import { CTCAE_CATEGORY, CTCAE_DATABASE, CTCAE_MODEL } from './model';


const CATEGORY_TERM_ID = "MEDRA";
const GRADE_CLASSIFICATION_TERM = "CTCAETERM";
const accept_no_adverse_reaction = true;
const no_adverse_reaction_label = "0-Absence of an adverse event or within normal limits";


/**
 * Manager for the CTCAE terms. 
 * This is a rewrite of the existing managers used in FormScript. The intention is to make the usage clear and defined. 
 * Also we want to minimize the bytes in the codes used. The previous versions had lots of duplicates. 
 * 
 * @see addListenersCtcae
 */
export class CTCAEManager {


    constructor(private db: CTCAE_DATABASE) {

    }

    public getCategories(): CodedItem[]{
        return this.db.categories.map(categoryToCodedItem);
    }
    public getTerms(): CodedItem[] {
        return this.db.models.map(modelAsPrimaryCodedItem);
    }
    public getGrades():CodedItem[]{
        return this.db.models.flatMap(modelToGradingCodedItems);
    }
    public getTermsByCategory(t?:DvCodedText){
        const code = t?.definingCode.codeString;
        if(code == undefined){
            return this.getTerms();
        }else{
            return this.db.models.filter(x=>x.category == code).map(modelAsPrimaryCodedItem);
        }
    }
    public getGradesByCategory(t?:DvCodedText){
        const code = t?.definingCode.codeString;
        if(code == undefined){
            return this.getGrades();
        }else{
            return this.db.models.filter(x=>x.category == code).flatMap(modelToGradingCodedItems);
        }
    }
    public getGradingsByTerm(t?:DvCodedText){
        const code = t?.definingCode.codeString;
        if(code == undefined){
            return this.getGrades();
        }else{
            return this.db.models.filter(x=>x.code.toString() == code).flatMap(modelToGradingCodedItems);
        }
    }
}



export function modelAsPrimaryCodedItem(t: CTCAE_MODEL) {
    return new CodedItem(`${t.code}`, t.term, t.definition, CATEGORY_TERM_ID);
}

export function modelToGradingCodedItems(t: CTCAE_MODEL) {
    const items: CodedItem[] = [];
    addIf(1, t.g1);
    addIf(2, t.g2);
    addIf(3, t.g3);
    addIf(4, t.g4);
    addIf(5, t.g5);
    return items;
    /**
     * Add grade if value is not - 
     * @param n 
     * @param value 
     */
    function addIf(n: number, value: string) {        
        if (value.trim() == "-") {
            console.log(`Skipping ${value} for items n=${n}`);

        } else {
            items.push(create(n, value));
        }
        function create(n: number, value: string) {
            return new CodedItem(`${n}-${t.code}`, value, value, GRADE_CLASSIFICATION_TERM);
        }
    }

}

function categoryToCodedItem(x:CTCAE_CATEGORY):CodedItem{
    return new CodedItem(x.id.toString(), x.name, x.name, CATEGORY_TERM_ID  );
}