// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { FileProvider } from './file-provider';
import { QueryProvider } from './query-provider';
import { getTagGroups } from './tag-group';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const fileProvider = new FileProvider(vscode.workspace.rootPath!);
    vscode.window.registerTreeDataProvider('files', fileProvider);
    vscode.commands.registerCommand('files.openFile', (resource) =>
        vscode.window.showTextDocument(resource)
    );

    const queryProvider = new QueryProvider();
    vscode.window.registerTreeDataProvider('queries', queryProvider);
    context.subscriptions.push(
        vscode.commands.registerCommand('queries.addGroup', async () => {
            const quickPick = vscode.window.createQuickPick();
            const tagInfo = getTagGroups();

            // I made this line suck cause I wanna declare groups as an array. need to think more
            const groups = Object.entries(tagInfo.groups);

            quickPick.items = groups.map(([label, tagGroup]) => ({ label }));
            quickPick.onDidChangeSelection((selection) => {
                if (
                    queryProvider.queryList.findIndex((tag) => {
                        return tag === selection[0].label;
                    }) !== -1
                ) {
                    vscode.commands.executeCommand(
                        'queries.delete',
                        selection[0].label
                    );
                } else {
                    queryProvider.queryList = queryProvider.queryList.concat([
                        selection[0].label,
                    ]);

                    fileProvider.queries = queryProvider.queryList;
                    queryProvider.refresh();
                    fileProvider.refresh();
                }
            });
            quickPick.onDidHide(() => quickPick.dispose());
            quickPick.show();
        })
    );
    vscode.commands.registerCommand('queries.delete', (groupName) => {
        const index = queryProvider.queryList.findIndex((tagGroup) => {
            return tagGroup === groupName;
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
