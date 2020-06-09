export interface TagInfo {
    version: number;
    groups: {
        [key: string]: TagGroup;
    };
}

interface TagGroup {
    type: string;
    tags: string[];
}
