import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { Item } from './item';
import { TagInfo, TagToFiles } from './interface/tag-info.interface';

export class FileProvider implements vscode.TreeDataProvider<Item> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        Item | undefined
    > = new vscode.EventEmitter<Item | undefined>();
    private _queries: string[] = [];

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

            let Items: Item[] = [];
            // declarative 하지 못함 개극혐인데 이번 함수 호출 내에 처리될 파일들
            let currentRemainedFiles: string[] = element.remainedFiles;
            // 다음 쿼리가 있으면
            if (element.tagToFilesGroupedByQuery.length !== 0) {
                const nextTagToFiles = element.tagToFilesGroupedByQuery[0];

                // 필터하는 곳이 여러 군데 퍼져 있음 태그별로 remainedFiles 를 관리하며 내려가는 것보다 편해서 일단 이렇게 작성함
                // 이번 쿼리에는 해당하지만 다음 쿼리에는 해당하지 않는 친구들을 걸러냄
                currentRemainedFiles = element.remainedFiles.filter((file) =>
                    nextTagToFiles.reduce<boolean>(
                        (bool, tagToFile) =>
                            bool &&
                            !Object.values(tagToFile)
                                .reduce(
                                    (flattened, elem) => [
                                        ...flattened,
                                        ...elem,
                                    ],
                                    [],
                                )
                                .includes(file),
                        true,
                    ),
                );
                // 다음 쿼리에 포함되는 파일들
                const nextRemainedFiles = element.remainedFiles.filter(
                    (file) => !currentRemainedFiles.includes(file),
                );

                Items =
                    nextRemainedFiles.length === 0
                        ? []
                        : element.tagToFilesGroupedByQuery[0].reduce<Item[]>(
                              (arr, firstTagToFiles) => [
                                  ...arr,
                                  ...Object.entries(firstTagToFiles)
                                      .map(
                                          ([tag]) =>
                                              new Item(
                                                  tag,
                                                  vscode.TreeItemCollapsibleState.Collapsed,
                                                  // 다음 쿼리에는 해당하지만 다음 태그에는 해당하지 않는 파일 제거
                                                  nextRemainedFiles.filter(
                                                      (file) =>
                                                          file.includes(tag),
                                                  ),
                                                  element.tagToFilesGroupedByQuery.slice(
                                                      1,
                                                  ),
                                              ),
                                      )
                                      // 다음 태그에 해당하는 파일 아예 없으면 태그 자체를 표시 안함
                                      .filter(
                                          (item) =>
                                              item.remainedFiles.length !== 0,
                                      ),
                              ],
                              [],
                          );
            }
            return [
                ...Items,
                ...currentRemainedFiles.map(
                    (file) =>
                        new Item(
                            file,
                            vscode.TreeItemCollapsibleState.None,
                            [],
                            [],
                        ),
                ),
            ];
        } else {
            if (this._queries.length === 0) {
                return [];
            }
            const tagToFilesGroupedByQuery: TagToFiles[][] = this._queries.map(
                (query) =>
                    this.tagInfo.groups[query].tags.map((tag) => ({
                        [tag]: this.tagInfo.tags[tag],
                    })),
            );

            // 자료구조가 너무 복잡한 것 같음 태그간의 순서 레벨이 필요하다고 생각했는데 단순화할 방법이 있을지 모르겠음
            return tagToFilesGroupedByQuery[0].reduce<Item[]>(
                (arr, firstTagToFiles) => [
                    ...arr,
                    ...Object.entries(firstTagToFiles).map(
                        ([tag, files]) =>
                            new Item(
                                tag,
                                vscode.TreeItemCollapsibleState.Collapsed,
                                files,
                                // slice가 범위 넘으면 빈 배열
                                tagToFilesGroupedByQuery.slice(1),
                            ),
                    ),
                ],
                [],
            );
        }
    }

    set queries(queries: string[]) {
        this._queries = queries;
    }
}
