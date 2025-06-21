export type CTCAE_FIELDS = {
    category: string;
    term: string;
    grade_classification: string;
    grade_ordinal: string;
    ctcae_cluster: string;
    ctcae_version: string;
    alvorlighetsgrad?: string;

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
    change?: string;
};

export type CTCAE_DATABASE = {
    categories: CTCAE_CATEGORY[];
    models: CTCAE_MODEL[];
};
export type CTCAE_CATEGORY = {
    id: number;
    name: string;
};