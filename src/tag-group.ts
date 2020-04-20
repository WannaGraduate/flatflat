import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { TagInfo } from './interface/tag-info.interface';

export function getTagGroups() {
    const { groups }: TagInfo = JSON.parse(fs.readFileSync(path.join(vscode.workspace.rootPath!, '.vscode', 'file-tag-system.json'), {encoding: 'utf8'}));
    
    return Object.keys(groups);
}