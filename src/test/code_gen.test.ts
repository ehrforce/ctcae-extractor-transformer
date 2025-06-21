import {  modelAsPrimaryCodedItem, modelToGradingCodedItems } from "../CTCAE/CtcaeManager";
import { CTCAE_MODEL } from "../CTCAE/model";


describe("Test code gen", () => {
    test("First test", () => {
        const t: CTCAE_MODEL = {
            "code": 10048580,
            "category": "Blood and lymphatic system disorders",
            "term": "Bone marrow hypocellular",
            "g1": "Mildly hypocellular or <=25% reduction from normal cellularity for age",
            "g2": "Moderately hypocellular or >25 - <50% reduction from normal cellularity for age",
            "g3": "Severely hypocellular or >50 - <=75% reduction cellularity from normal for age",
            "g4": "Aplastic persistent for longer than 2 weeks",
            "g5": "Death",
            "definition": "A disorder characterized by the inability of the bone marrow to produce hematopoietic elements."
        };
        const res = modelToGradingCodedItems(t);
        expect(res.length).toBe(5);

    })

    test("Model with emtpy grades", () => {
        const t: CTCAE_MODEL = {
            "code": 10014950,
            "category": "Blood and lymphatic system disorders",
            "term": "Eosinophilia",
            "g1": ">ULN and >Baseline",
            "g2": " -",
            "g3": "Steroids initiated",
            "g4": " -",
            "g5": " -",
            "definition": "A disorder characterized by laboratory test results that indicate an increased number of eosinophils in the blood.",
            "change": "Addition: Term"
        };
        const code = modelAsPrimaryCodedItem(t);
        expect(code.code).toBe("10014950");
        expect(code.name).toBe("Eosinophilia");
        expect(code.description).toBe("A disorder characterized by laboratory test results that indicate an increased number of eosinophils in the blood.")


        const res = modelToGradingCodedItems(t);
        expect(res.length).toBe(2);
    })
})

