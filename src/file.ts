import * as vscode from 'vscode';
import { Sth } from './file-provider';

export class Item extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public parentTagNames: string[],
        public children: Sth | null,
        public uri?: string,
        public command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return this.label;
    }
}

// export class Tag extends vscode.TreeItem {
//     constructor(
//         public readonly label: string,
//         public readonly uri: string,
//         public readonly collapsibleState:
//             | vscode.TreeItemCollapsibleState.Collapsed
//             | vscode.TreeItemCollapsibleState.Expanded,
//         public children: (Tag | Tag)[],
//         public command?: vscode.Command
//     ) {
//         super(label, collapsibleState);
//     }

//     get tooltip(): string {
//         return this.label;
//     }
// }
