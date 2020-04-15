import * as vscode from 'vscode';

import { Tag } from './tag';

export class QueryProvider implements vscode.TreeDataProvider<Tag> {

    private _onDidChangeTreeData: vscode.EventEmitter<Tag | undefined> = new vscode.EventEmitter<Tag | undefined>();
    private _queryList: Tag[] = [];

	readonly onDidChangeTreeData: vscode.Event<Tag | undefined> = this._onDidChangeTreeData.event;

	constructor() {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Tag): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Tag): Tag[] {
        return this._queryList;
    }

    set queryList(queryList: Tag[]) {
        this._queryList = queryList;
    }

    get queryList() {
        return this._queryList;
    }
}