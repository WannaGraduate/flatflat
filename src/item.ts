import * as vscode from 'vscode';
export class Item extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public remainedFiles: string[],
        public tagsGroupedByQuery: string[][],
        public iconPath?: vscode.ThemeIcon,
        public resourceUri?: vscode.Uri,
        public command?: vscode.Command,
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return this.label;
    }
}
