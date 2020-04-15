import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { Tag } from './tag';

const gitIgnores = fs.readFileSync(path.join(__dirname, '../', '.gitignore'), 'utf8').split('\n');
const ignores = gitIgnores.concat([
    '.git',
]);

export class TagProvider implements vscode.TreeDataProvider<Tag> {

    private _onDidChangeTreeData: vscode.EventEmitter<Tag | undefined> = new vscode.EventEmitter<Tag | undefined>();
    private TagList: Tag[] = [];

	readonly onDidChangeTreeData: vscode.Event<Tag | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
        this.getTagList();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Tag): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Tag): Tag[] {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No Tag in empty workspace');
			return [];
		}
        if (!element) {
            return this.TagList;
        } else {
            return [];
        }
    }
    
    private getTagList() {
        if (this.workspaceRoot) {
            const fileList = fs.readdirSync(this.workspaceRoot);
            for (const file of fileList) {
                const uri = path.join(this.workspaceRoot, file);
                const stat = fs.lstatSync(uri);
                if (ignores.indexOf(file) === -1) {
                    if (stat.isFile()) {
                        const tagLabels = file.split('.').slice(1, file.split('.').length - 1);
                        tagLabels.forEach(tagLabel => {
                            if (this.TagList.findIndex(tag => {
                                return tag.label === tagLabel;
                            }) === -1) {
                                this.TagList.push(new Tag(tagLabel, vscode.TreeItemCollapsibleState.None, {
                                    command: 'tags.apply',
                                    title: '',
                                    arguments: [tagLabel],
                                }));
                            }
                        });
                    }
                }
            }
        }
    }
}