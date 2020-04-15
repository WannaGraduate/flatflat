// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { FileProvider } from './file-provider';
import { uniqBy } from './lib/uniqBy';
import { QueryProvider } from './query-provider';
import { Tag } from './tag';
import { TagProvider } from './tag-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const tagProvider = new TagProvider(vscode.workspace.rootPath!);
    const queryProvider = new QueryProvider();
    const fileProvider = new FileProvider(vscode.workspace.rootPath!);
    vscode.window.registerTreeDataProvider('tags', tagProvider);
    vscode.window.registerTreeDataProvider('queries', queryProvider);
    vscode.window.registerTreeDataProvider('files', fileProvider);
    vscode.commands.registerCommand('files.openFile', (resource) => vscode.window.showTextDocument(resource));
    vscode.commands.registerCommand('tags.apply', tagName => {
        const queryList = uniqBy(queryProvider.queryList.concat([new Tag(tagName, vscode.TreeItemCollapsibleState.None, {
            command: 'queries.delete',
            title: '',
            arguments: [tagName],
        })]), 'label');
        queryProvider.queryList = queryList;
        fileProvider.queries = queryList;
        queryProvider.refresh();
        fileProvider.refresh();
    });
    vscode.commands.registerCommand('queries.delete', tagName => {
        const index = queryProvider.queryList.findIndex(tag => {
            return tag.label === tagName;
        });
        if (index !== -1) {
            queryProvider.queryList.splice(index, 1);
            fileProvider.queries = queryProvider.queryList;
        }
        queryProvider.refresh();
        fileProvider.refresh();
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
