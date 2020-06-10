import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { convert } from './convert';
import { FileProvider } from './file-provider';
import { QueryProvider } from './query-provider';
import { getTagGroups } from './tag-group';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('Convert', () => {
        convert(vscode.workspace.rootPath!);
    });

    if (!fs.existsSync(path.join(vscode.workspace.rootPath!, 'file-tag-system.json'))) {
        vscode.window.showInformationMessage('No file-tag-system.json.');
    } else {
        const fileProvider = new FileProvider(vscode.workspace.rootPath!);
        vscode.window.registerTreeDataProvider('files', fileProvider);
        vscode.commands.registerCommand('files.openFile', (resource) =>
            vscode.window.showTextDocument(resource),
        );
        const queryProvider = new QueryProvider();
        vscode.window.registerTreeDataProvider('queries', queryProvider);
        context.subscriptions.push(
            vscode.commands.registerCommand('queries.addGroup', async () => {
                const quickPick = vscode.window.createQuickPick();

                quickPick.items = getTagGroups().map((label) => ({ label }));
                quickPick.onDidChangeSelection((selection) => {
                    if (
                        queryProvider.queryList.findIndex((tag) => {
                            return tag === selection[0].label;
                        }) !== -1
                    ) {
                        vscode.commands.executeCommand(
                            'queries.delete',
                            selection[0].label,
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
            }),
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
}

// this method is called when your extension is deactivated
export function deactivate() {}
