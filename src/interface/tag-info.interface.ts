export interface TagInfo {
    version: number;
    groups: {
        [key: string]: TagGroup;
    };
    tags: {
        [key: string]: string[];
    };
}

export interface TagGroup {
    type: string;
    tags: string[];
}
