import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { File } from './file';
import { uniqBy } from './lib/uniqBy';

export class FileProvider implements vscode.TreeDataProvider<File> {

    private _onDidChangeTreeData: vscode.EventEmitter<File | undefined> = new vscode.EventEmitter<File | undefined>();
    private _queries: string[] = [];
    private fileList: File[] = [];

	readonly onDidChangeTreeData: vscode.Event<File | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
        this._onDidChangeTreeData.fire();
        this.getFileList();
	}

	getTreeItem(element: File): vscode.TreeItem {
		return element;
	}

	getChildren(element?: File): File[] {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No File in empty workspace');
			return [];
		}
        if (!element) {
            return this.fileList;
        } else {
            return [];
        }
    }

    set queries(queries: string[]) {
        this._queries = queries;
    }

    private getFileList() {
        if (this.workspaceRoot) {
            const fileList = fs.readdirSync(this.workspaceRoot);
            this.fileList = [];
            for (const file of fileList) {
                for (const query of this._queries) {
                    if (file.includes(query)) {
                        this.fileList = uniqBy(this.fileList.concat([new File(file, path.join(this.workspaceRoot, file), vscode.TreeItemCollapsibleState.None, { 
                            command: 'files.openFile', 
                            title: "Open File", 
                            arguments: [vscode.Uri.parse(path.join(this.workspaceRoot, file))], 
                        })]), 'label');
                    }
                }
            }
        }
    }
}
