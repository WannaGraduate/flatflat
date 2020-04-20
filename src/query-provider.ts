import * as vscode from 'vscode';

export class QueryProvider implements vscode.TreeDataProvider<string> {

    private _onDidChangeTreeData: vscode.EventEmitter<string | undefined> = new vscode.EventEmitter<string | undefined>();
    private _queryList: string[] = [];

	readonly onDidChangeTreeData: vscode.Event<string | undefined> = this._onDidChangeTreeData.event;

	constructor() {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: string): vscode.TreeItem {
		return {
            label: element,
            command: {
                command: 'queries.delete',
                title: '',
                arguments: [element],
            }
        };
	}

	getChildren(element?: string): string[] {
        return this._queryList;
    }

    set queryList(queryList: string[]) {
        this._queryList = queryList;
    }

    get queryList() {
        return this._queryList;
    }
}