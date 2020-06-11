import * as fs from 'fs';
import * as path from 'path';

import { TagInfo } from './interface/tag-info.interface';

// treeToTag에서 파일명을 절대경로가 아니라 상대경로로 넣기 위해 필요
let rootDir = '';

/**
 * workspace 경로를 받아 해당 경로 하단에 /.vscode/file-tag-system.json을 만들어주는 함수
 * @param workspacePath workspace 경로
 */
export function convert(workspacePath: string) {
  rootDir = workspacePath;

  if (!fs.existsSync(path.join(workspacePath, 'file-tag-system converted'))) {
      fs.mkdirSync(path.join(workspacePath, 'file-tag-system converted'));
    }
  const tagInfo = treeToTag(workspacePath, ['.git', '.vscode']);
  fs.writeFileSync(
    path.join(workspacePath, 'file-tag-system converted', 'file-tag-system.json'),
    JSON.stringify(tagInfo, null, 4)
  );
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
    rootDir: '',
    groups: {},
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
        const { groups } = treeToTag(uri, updatedIgnores);

        // 재귀 호출 결과 합치기
        Object.keys(groups).forEach((groupName) => {
          if (result.groups[groupName]) {
            result.groups[groupName].tags = result.groups[
              groupName
            ].tags.concat(groups[groupName].tags);
          } else {
            result.groups[groupName] = groups[groupName];
          }
        });
      } else {
        if (!uri.includes('file-tag-system converted')) {
            const relativeDir = path.relative(rootDir, uri);
            const convertedFileName = relativeDir.split(path.sep).join('.');

            const convertedPath = path.join(rootDir, 'file-tag-system converted');

            fs.copyFileSync(
              uri,
              path.join(convertedPath, convertedFileName)
            );
        }
      }
    }
  }

  result.groups = Object.keys(result.groups).reduce(
    (groups: TagInfo['groups'], groupName) => {
      if (result.groups[groupName].tags.length === 1) {
        return groups;
      } else {
        groups[groupName] = result.groups[groupName];

        return groups;
      }
    },
    {}
  );

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
    gitIgnores = fs
      .readFileSync(path.join(folderPath, '.gitignore'), 'utf8')
      .split('\n');
  }
  return gitIgnores.concat(ignores);
}
