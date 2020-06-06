import * as fs from 'fs';
import * as path from 'path';

import { TagInfo } from '../interface/tag-info.interface';

export function migrate(workspacePath: string) {
    // const gitIgnores = fs.readFileSync(path.join(workspacePath, '.gitignore'), 'utf8').split('\n');
    // const ignores = gitIgnores.concat([
    //     '.git',
    // ]);
    // const tagInfo = treeToTag(workspacePath, ignores);
    // if (!fs.existsSync(path.join(workspacePath, '.vscode'))) {
    //     fs.mkdirSync(path.join(workspacePath), '.vscode');
    // }
    // fs.writeFileSync(path.join(workspacePath, '.vscode', 'file-tag-system.json'), JSON.stringify(tagInfo, null, 2));
}

function treeToTag(folderPath: string, ignores: string[]): TagInfo {
    const fileList = fs.readdirSync(folderPath);
    let [tag] = folderPath.split('/').slice(-1);
    const result: TagInfo = {
        version: 1,
        groups: {},
        tags: {},
    };

    for (const file of fileList) {
        const uri = path.join(folderPath, file);
        const stat = fs.lstatSync(uri);
        if (ignores.indexOf(file) === -1) {
            if (stat.isDirectory()) {
                if (result.groups[tag]) {
                    result.groups[tag].tags.push(file);
                } else {
                    result.groups[tag] = {
                        type: 'any',
                        tags: [file],
                    };
                }
                const {groups, tags}= treeToTag(uri, ignores);
                Object.keys(groups).forEach(groupName => {
                    if (result.groups[groupName]) {
                        result.groups[groupName].tags = result.groups[groupName].tags.concat(groups[groupName].tags);
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
                if (tag === '') {
                    tag = 'Untagged';
                }
                if (result.tags[tag]) {
                    result.tags[tag].push(uri);
                } else {
                    result.tags[tag] = [uri];
                }
            }
        }
    }

    return result;
}
