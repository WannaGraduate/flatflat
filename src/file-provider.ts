import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { Item } from './file';
import { TagGroup, TagInfo } from './interface/tag-info.interface';

export class FileProvider implements vscode.TreeDataProvider<Item> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        Item | undefined
    > = new vscode.EventEmitter<Item | undefined>();
    private _queries: string[] = [];
    //private fileList: Item[] = [];
    private tagInfo: TagInfo = JSON.parse(
        fs.readFileSync(
            path.join(
                vscode.workspace.rootPath!,
                '.vscode',
                'file-tag-system.json',
            ),
            {
                encoding: 'utf8',
            },
        ),
    );

    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this
        ._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
        // this.getChildren();
    }

    getTreeItem(element: Item): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Item): Item[] {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No File in empty workspace');
            return [];
        }
        if (element) {
            if (
                element.collapsibleState ===
                vscode.TreeItemCollapsibleState.None
            ) {
                return [];
            }

            if (element.children === null) {
                const { tags }: TagInfo = this.tagInfo;
                const rootFiles = [
                    ...new Set(
                        Object.values(tags).reduce<string[]>(
                            (result, files) => {
                                return [...result, ...files];
                            },
                            [],
                        ),
                    ),
                ];

                const fileNames = rootFiles.filter((name) =>
                    [...element.parentTagNames, element.label].reduce<boolean>(
                        (bool, tag) => {
                            return bool && name.includes(tag);
                        },

                        true,
                    ),
                );
                return fileNames.map((fileName) => {
                    return new Item(
                        fileName,
                        vscode.TreeItemCollapsibleState.None,
                        [...element.parentTagNames, element.label],
                        null,
                        path.join(this.workspaceRoot, fileName),
                        {
                            command: 'files.openFile',
                            title: 'Open File',
                            arguments: [
                                vscode.Uri.file(
                                    path.join(this.workspaceRoot, fileName),
                                ),
                            ],
                        },
                    );
                });
            } else {
                return Object.entries(element.children!).map(([k, v]) => {
                    return new Item(
                        k,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        [...element.parentTagNames, element.label],
                        v,
                    );
                });
            }
        } else {
            if (this._queries.length === 0) {
                return [];
            }

            const groupEntries = Object.entries(this.tagInfo.groups);
            const queriedGroups: [string, TagGroup][] = this._queries.map(
                (query) =>
                    groupEntries.find(([groupName]) => groupName === query)!,
            );

            //const tagFileTuples = Object.entries(tagInfo.tags);
            const queriedTagMatrix = Array.from(
                { length: queriedGroups.length },
                (_, i) => queriedGroups[i][1].tags,
            );
            console.log(queriedTagMatrix);
            const obj = makeSth(0, queriedTagMatrix);
            // const queriedTags = queriedTagMatrix.reduce((result, tags) => [
            //     ...result,
            //     ...tags,
            // ]);

            return queriedTagMatrix[0].map((tag) => {
                return new Item(
                    tag,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    [],
                    obj[tag],
                );
            });
        }
    }

    set queries(queries: string[]) {
        this._queries = queries;
    }
}

const makeSth = (i: number, tagMatrix: string[][]): Sth => {
    const keys = tagMatrix[i];

    if (i === tagMatrix.length - 1) {
        return keys.reduce<Sth>(
            (result, tag) => ({
                ...result,
                [tag]: null,
            }),
            {},
        );
    }

    return keys.reduce<Sth>((result, tag) => {
        return { ...result, [tag]: makeSth(i + 1, tagMatrix) };
    }, {});
};

export interface Sth {
    [key: string]: Sth | null;
}
