import { minimatch } from 'minimatch';
import * as vscode from 'vscode';
import path = require('path');

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
export const extractTextInQuotes = (text: string, position: vscode.Position, wholeWord = false) => {
    const left = text.substring(0, position.character);
    const right = text.substring(position.character, text.length);
    const extractText = (leftIndex: number, rightIndex: number) => {
        if (wholeWord) {
            const words = right.substring(0, rightIndex).split('.');
            return left.substring(leftIndex + 1) + words[0];
        } else {
            return left.substring(leftIndex + 1);
        }
    };

    const bothIncludeSingle = left.includes("'") && right.includes("'");
    const bothIncludeDouble = left.includes('"') && right.includes('"');
    if (bothIncludeSingle) {
        if (bothIncludeDouble) {
            const leftIndexSingle = left.lastIndexOf("'");
            const leftIndexDouble = left.lastIndexOf('"');
            const rightIndexSingle = right.indexOf("'");
            const rightIndexDouble = right.indexOf('"');
            const leftSingle = leftIndexSingle > leftIndexDouble;
            const rightDouble = rightIndexSingle < rightIndexDouble;
            let leftIndex, rightIndex;
            if (leftSingle && rightDouble) {
                // single quotes are innermost
                leftIndex = leftIndexSingle;
                rightIndex = rightIndexSingle;
            } else if (!leftSingle && !rightDouble) {
                // double quotes are innermost
                leftIndex = leftIndexDouble;
                rightIndex = rightIndexDouble;
            } else {
                // single and double quotes overlap
                return null;
            }
            return extractText(leftIndex, rightIndex);
        } else {
            const leftIndex = left.lastIndexOf("'");
            const rightIndex = right.indexOf("'");
            return extractText(leftIndex, rightIndex);
        }
    } else if (bothIncludeDouble) {
        const leftIndex = left.lastIndexOf('"');
        const rightIndex = right.indexOf('"');
        return extractText(leftIndex, rightIndex);
    } else {
        return null;
    }
};

export const isPathAbsolute = (path: string) => {
    return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
};

const convertSlashes = (path: string) => path.replace(/\\/g, '/');

export const findCompletionSource = (document: vscode.TextDocument): { localPath: string, originalPath: string } | null => {
    const { config } = vscode.workspace.getConfiguration('jsonCodeCompletion');
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;

    let originalPath = null;
    for (const { destinationPattern, sourcePath } of config) {
        let relativeFileName = convertSlashes(document.fileName).replace(convertSlashes(workspacePath) + '/', '');
        if (destinationPattern.startsWith('./')) {
            relativeFileName = './' + relativeFileName;
        }
        if (minimatch(relativeFileName, destinationPattern, { dot: true })) {
            originalPath = sourcePath;
            break;
        }
    }
    if (originalPath) {
        const localPath = isPathAbsolute(originalPath) ? originalPath : convertSlashes(workspacePath) + '/' + originalPath;
        return { originalPath, localPath };
    } else {
        return null;
    }
};

export const findDestinationPattern = async (document: vscode.TextDocument): Promise<{ destinationPattern: string } | null> => {
    const { config } = vscode.workspace.getConfiguration('jsonCodeCompletion');
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;

    let foundDestinationPattern = null;
    for (const { sourcePath, destinationPattern } of config) {
        const localPath = isPathAbsolute(sourcePath) ? sourcePath : convertSlashes(workspacePath) + '/' + sourcePath;

        // TODO handle multiple patterns with the same source
        const resolvedPath = convertSlashes(path.resolve(localPath));
        if (resolvedPath === convertSlashes(document.uri.fsPath)) {
            if (destinationPattern.startsWith('./')) {
                foundDestinationPattern = destinationPattern.substring(2);
            } else {
                foundDestinationPattern = destinationPattern;
            }
            break;
        }
    }
    if (foundDestinationPattern) {
        return { destinationPattern: foundDestinationPattern };
    } else {
        return null;
    }
};