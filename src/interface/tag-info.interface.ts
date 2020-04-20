export interface TagInfo {
    version: number;
    groups: {
        [key: string]: TagGroup;
    };
    tags: {
        [key: string]: string[];
    }
}

interface TagGroup {
    type: string
    tags: string[]
}