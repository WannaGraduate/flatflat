import * as fs from 'fs';
import * as path from 'path';

import { TagInfo } from '../interface/tag-info.interface';

// treeToTag에서 파일명을 절대경로가 아니라 상대경로로 넣기 위해 필요
let rootDir = '';

/**
 * workspace 경로를 받아 해당 경로 하단에 /.vscode/file-tag-system.json을 만들어주는 함수
 * @param workspacePath workspace 경로
 */
export function migrate(workspacePath: string) {
    rootDir = workspacePath;

    const tagInfo = treeToTag(workspacePath, [
        '.git',
        '.vscode',
    ]);
    if (!fs.existsSync(path.join(workspacePath, '.vscode'))) {
        fs.mkdirSync(path.join(workspacePath, '.vscode'));
    }
    fs.writeFileSync(path.join(workspacePath, '.vscode', 'file-tag-system.json'), JSON.stringify(tagInfo, null, 4));
}

/**
 * 경로를 받아 TagInfo 형태로 만들어주는 함수
 * @param folderPath 태그로 만들 경로
 * @param ignores 무시해야 하는 파일/폴더명
 */
function treeToTag(folderPath: string, ignores: string[]): TagInfo {
    const fileList = fs.readdirSync(folderPath);
    const [tag] = folderPath.split(path.sep).slice(-1);
    const result: TagInfo = {
        version: 1,
        groups: {},
        tags: {},
    };
    const updatedIgnores = getIgnores(folderPath, ignores);

    for (const file of fileList) {
        const uri = path.join(folderPath, file);
        const stat = fs.lstatSync(uri);
        if (updatedIgnores.indexOf(file) === -1) {
            if (stat.isDirectory()) {
                // uri 끝이 디렉토리이면 하나 상단 디렉토리가 태그 그룹명이 되고 디렉토리는 태그 그룹 안의 태그가 됨
                if (result.groups[tag]) {
                    result.groups[tag].tags.push(file);
                } else {
                    result.groups[tag] = {
                        type: 'any',
                        tags: [file],
                    };
                }

                // 재귀 호출
                const {groups, tags}= treeToTag(uri, updatedIgnores);

                // 재귀 호출 결과 합치기
                Object.keys(groups).forEach(groupName => {
                    if (result.groups[groupName]) {
                        result.groups[groupName].tags = [...new Set(result.groups[groupName].tags.concat(groups[groupName].tags))];
                    } else {
                        result.groups[groupName] = groups[groupName];
                    }
                });
                Object.keys(tags).forEach(tagName => {
                    if (result.tags[tagName]) {
                        result.tags[tagName] = result.tags[tagName].concat(tags[tagName]);
                    } else {
                        result.tags[tagName] = tags[tagName];
                    }
                });
            } else {
                const relativeDir = path.relative(rootDir, uri);
                const relativeFolders = relativeDir.split(path.sep);

                // uri 끝이 파일이면 파일을 태그에 추가하되, 하나 상단 디렉토리만 태그로 추가하는 것이 아니라 rootDir 기준 상대 경로에 있는 디렉토리 전체에 추가
                relativeFolders.forEach(tagName => {
                    if (result.tags[tagName]) {
                        result.tags[tagName].push(relativeDir);
                    } else {
                        result.tags[tagName] = [relativeDir];
                    }
               });
            }
        }
    }

    return result;
}

/**
 * 무시할 파일/폴더 리스트 만들기
 * @param folderPath .gitignore 가져올 경로
 * @param ignores 직접 추가할 ignore
 */
function getIgnores(folderPath: string, ignores: string[]) {
    let gitIgnores: string[] = [];
    if (fs.existsSync(path.join(folderPath, '.gitignore'))) {
        gitIgnores = fs.readFileSync(path.join(folderPath, '.gitignore'), 'utf8').split('\n');
    }
    return gitIgnores.concat(ignores);
}