import * as vscode from 'vscode';
import { TagToFiles } from './interface/tag-info.interface';

export class Item extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public remainedFiles: string[],
        public tagToFilesGroupedByQuery: TagToFiles[][],
        public uri?: string,
        public command?: vscode.Command,
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return this.label;
    }
}
