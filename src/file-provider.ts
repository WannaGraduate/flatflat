import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { TagInfo } from './interface/tag-info.interface';
import { Item } from './item';

export class FileProvider implements vscode.TreeDataProvider<Item> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        Item | undefined
    > = new vscode.EventEmitter<Item | undefined>();
    private _queries: string[] = [];

    private tagInfo: TagInfo = JSON.parse(
        fs.readFileSync(
            path.join(vscode.workspace.rootPath!, 'file-tag-system.json'),
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
        this.tagInfo = JSON.parse(
            fs.readFileSync(
                path.join(vscode.workspace.rootPath!, 'file-tag-system.json'),
                {
                    encoding: 'utf8',
                },
            ),
        );
        this.getChildren();
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

            let Items: Item[] = [];
            // declarative 하지 못함 개극혐인데 이번 함수 호출 내에 처리될 파일들
            let currentTagFiles: string[] = element.remainedFiles;
            // 다음 쿼리가 있으면
            if (element.tagsGroupedByQuery.length !== 0) {
                const nextTags = element.tagsGroupedByQuery[0];
                const nextRemainedFiles = element.remainedFiles.filter((file) =>
                    nextTags.some(
                        (next_tag) =>
                            file
                                .split('.')
                                .findIndex(
                                    (splitted) => splitted === next_tag,
                                ) !== -1,
                    ),
                );
                currentTagFiles = element.remainedFiles.filter(
                    (file) => !nextRemainedFiles.includes(file),
                );

                Items =
                    nextRemainedFiles.length === 0
                        ? []
                        : nextTags
                              .map(
                                  (tag) =>
                                      new Item(
                                          tag,
                                          vscode.TreeItemCollapsibleState.Collapsed,
                                          // 다음 쿼리에는 해당하지만 다음 태그에는 해당하지 않는 파일 제거
                                          nextRemainedFiles.filter(
                                              (file) =>
                                                  file
                                                      .split('.')
                                                      .findIndex(
                                                          (splitted) =>
                                                              splitted === tag,
                                                      ) !== -1,
                                          ),
                                          element.tagsGroupedByQuery.slice(1),
                                      ),
                                  // 다음 태그에 해당하는 파일 아예 없으면 태그 자체를 표시 안함
                              )
                              .filter(
                                  (item) => item.remainedFiles.length !== 0,
                              );
            }
            return [
                ...Items,
                ...currentTagFiles.map(
                    (file) =>
                        new Item(
                            file,
                            vscode.TreeItemCollapsibleState.None,
                            [],
                            [],
                            vscode.Uri.file(
                                path.join(this.workspaceRoot, this.tagInfo.rootDir, file),
                            ),
                            {
                                command: 'files.openFile',
                                title: 'Open File',
                                arguments: [
                                    vscode.Uri.file(
                                        path.join(this.workspaceRoot, this.tagInfo.rootDir, file),
                                    ),
                                ],
                            },
                        ),
                ),
            ];
        } else {
            const rootFiles = fs.readdirSync(path.join(this.workspaceRoot, this.tagInfo.rootDir));

            const gitIgnores = fs.existsSync(
                path.join(this.workspaceRoot, '.gitignore'),
            )
                ? fs
                      .readFileSync(
                          path.join(this.workspaceRoot, '.gitignore'),
                          'utf8',
                      )
                      .split('\n')
                : [];
            const ignores = [...gitIgnores, '.vscode', '.git', '.gitignore'];
            const targetFiles = rootFiles.filter(
                (file) => !ignores.includes(file),
            );

            // QUERIES 비어있으면 root 통째로
            if (this._queries.length === 0) {
                return targetFiles.map(
                    (file) =>
                        new Item(
                            file,
                            vscode.TreeItemCollapsibleState.None,
                            [],
                            [],
                            vscode.Uri.file(
                                path.join(this.workspaceRoot, this.tagInfo.rootDir, file),
                            ),
                            {
                                command: 'files.openFile',
                                title: 'Open File',
                                arguments: [
                                    vscode.Uri.file(
                                        path.join(this.workspaceRoot, this.tagInfo.rootDir, file),
                                    ),
                                ],
                            },
                        ),
                );
            }

            const tagsGroupedByQuery = this._queries.map(
                (query) => this.tagInfo.groups[query].tags,
            );

            const firstTags = tagsGroupedByQuery[0];

            const remainedFilesGroupedByTag = firstTags.map((tag) =>
                targetFiles.filter(
                    (file) =>
                        file
                            .split('.')
                            .findIndex((splitted) => splitted === tag) !== -1,
                ),
            );

            const notGroupedFiles = targetFiles.filter(
                (file) =>
                    !file
                        .split('.')
                        .find(
                            (s) => firstTags.findIndex((t) => s === t) !== -1,
                        ),
            );

            const grouped = firstTags.map(
                (levelOneTag, index) =>
                    new Item(
                        levelOneTag,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        remainedFilesGroupedByTag[index],
                        tagsGroupedByQuery.slice(1),
                    ),
            );

            return [
                ...grouped,
                new Item(
                    'non-' + this._queries[0],
                    vscode.TreeItemCollapsibleState.Collapsed,
                    notGroupedFiles,
                    tagsGroupedByQuery.slice(1),
                ),
            ];
        }
    }

    set queries(queries: string[]) {
        this._queries = queries;
    }
}
