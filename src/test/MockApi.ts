import { API, Container, EventType, ListenerCallback } from 'ehrcraft-form-api/dist/api';

import { DIPS } from 'ehrcraft-form-api/dist/dips/dips-models';



/**
 * Helper class to carry one listener
 */



export class CallbackItem {
    constructor(public id: string, public event: EventType, public cb: ListenerCallback) {
    }
}


/**
 * 
 */
export class MockApi implements API {
    private codeListItems: Record<string, DIPS.Terminology.CodedItem[]> = {};
    private terminologyIDs: Record<string, string> = {};

    getCodeListItems(formId: string, parent?: Container | undefined): DIPS.Terminology.CodedItem[] {
        return this.codeListItems[formId];

    }
    setCodeListItems(formId: string, values: DIPS.Terminology.CodedItem[], parent?: Container | undefined): boolean {
        console.log("setCodeListItems: " + formId + ", " + values.map(x => x.code));
        this.codeListItems[formId] = values;
        return true;
    }
    setTerminology(formId: string, terminologyName: string, parent?: Container | undefined): boolean {
        this.terminologyIDs[formId] = terminologyName;
        return true;

    }
    getDefinedCodeItems(formId: string): DIPS.Terminology.CodedItem[] {
        throw new Error('Method not implemented.');
    }

    public fieldsVisibility: Record<string, boolean> = {};
    private fieldValues: Record<string, any> = {};

    private callbacks: CallbackItem[] = [];
    public getFieldVisibility(formid: string): boolean {
        if (this.isFieldPresent(formid)) {
            const v = this.fieldsVisibility[formid];
            return v
        } else {
            return false;
        }

    }
    public isFieldPresent(formId: string) {
        return this.fieldsVisibility[formId] != null;
    }

    public getCallback(formId: string, event: EventType): ListenerCallback {
        let cb: ListenerCallback | null = null;
        this.callbacks.forEach(c => {
            if (c.id === formId && c.event === event) {
                cb = c.cb;
            }
        });
        if (cb == null) {
            throw Error("Callback is not registered");
        }
        return cb;
    }

    addListener(formId: string, event: EventType, cb: ListenerCallback): void {
        console.log("Adding listener " + formId);
        this.callbacks.push(new CallbackItem(formId, event, cb));

    }
    hideField(formId: string, parent?: Container): void {
        this.fieldsVisibility[formId] = false;
    }
    showField(formId: string, parent?: Container): void {
        this.fieldsVisibility[formId] = true;
    }
    clearField(formId: string, parent?: Container): void {
        console.debug("clearField " + formId);
    }
    resetField(formId: string, parent?: Container): void {
        console.debug("resetField " + formId);
    }
    enableField(formId: string, parent?: Container): void {
        console.debug("enableField" + formId);
    }
    disableField(formId: string, parent?: Container): void {
        console.debug("disableField: " + formId);
    }
    getFieldValue(formId: string, parent?: Container) {
        const result = this.fieldValues[formId];
        console.debug(`getFieldValue result = ${result} for formId = ${formId}`);
        return this.fieldValues[formId];
    }
    setFieldValue(formId: string, value: any, parent?: Container): void {
        console.debug("setFieldValue" + formId);
        this.fieldValues[formId] = value;
        this.callbacks.find(x => x.id === formId && x.event === "OnChanged")?.cb(formId, value, parent);
    }
    addField(formId: string) {
        console.debug("addField: " + formId);
    }
    removeField(field: Object): void {
        console.debug("removeField:  " + field);
    }
    getFields(formId: string, parent?: Container) {
        const result = [this.fieldValues[formId]];
        console.debug("getFields" + formId + ", " + result);
        return result;
    }
    setOccurrences(formId: string, occurences: string, parent?: Container): void {
        console.debug("setOccurences: " + formId);
    }
    setErrorMessage(formId: string, value: string, parent?: Container): void {
        console.debug("setErrorMessage: " + formId);
    }
    resetErrorMessage(formId: string, parent?: Container): void {
        console.debug("resetErrorMessage: " + formId);
    }
    getTemplateVariable(templateVariable: string) {
        console.debug("getTemplateVariable: " + templateVariable);
    }

}
