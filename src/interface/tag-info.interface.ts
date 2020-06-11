export interface TagInfo {
    version: number;
    rootDir: string;
    groups: {
        [key: string]: TagGroup;
    };
}

interface TagGroup {
    type: string;
    tags: string[];
}
