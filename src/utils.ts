import { minimatch } from 'minimatch';
import * as vscode from 'vscode';

// TODO handle double quotes
/**
 * Get text between the opening quote and the cursor inside a quoted piece of text 
 * 
 * @param text 
 * @param position cursor position 
 * @param wholeWord return whole word up to a ".", not only up to the cursor position
 * @returns
 * 	
 * input: "The quick brown 'fox jumps over' the lazy dog", position just after "s" in "jumps"
 * 
 * output: fox jumps
 */
export const betweenQuotes = (text: string, position: vscode.Position, wholeWord = false) => {
    const left = text.substring(0, position.character);
    const right = text.substring(position.character, text.length);
    if (left.includes("'") && right.includes("'")) {
        const leftHalf = left.split("'");
        if (wholeWord) {
            const rightHalf = right.split("'");
            const words = rightHalf[0].split('.');
            return leftHalf[leftHalf.length - 1] + words[0];
        } else {
            return leftHalf[leftHalf.length - 1];
        }
    } else {
        return null;
    }
};

export const isPathAbsolute = (path: string) => {
    return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
};

export const findCompletionSource = (document: vscode.TextDocument): { localPath: string, originalPath: string } | null => {
    const { config } = vscode.workspace.getConfiguration('jsonCodeCompletion');
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;

    let originalPath = null;
    for (const { destinationPattern, sourcePath } of config) {
        let relativeFileName = document.fileName.replace(workspacePath + '\\', '').replace(/\\/g, '/');
        if (destinationPattern.startsWith('./')) {
            relativeFileName = './' + relativeFileName;
        }
        if (minimatch(relativeFileName, destinationPattern, { dot: true })) {
            originalPath = sourcePath;
            break;
        }
    }
    if (originalPath) {
        const localPath = isPathAbsolute(originalPath) ? originalPath : workspacePath.replace(/\\/g, '/') + '/' + originalPath;
        return { originalPath, localPath };
    } else {
        return null;
    }
};