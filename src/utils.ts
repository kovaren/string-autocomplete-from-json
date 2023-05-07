import * as vscode from 'vscode';

// TODO handle double quotes
/**
 * Get text between the opening quote and the cursor inside a quoted piece of text 
 * 
 * @param text 
 * @param position cursor position 
 * @returns
 * 	
 * input: "The quick brown 'fox jumps over' the lazy dog", position just after "s" in "jumps"
 * 
 * output: fox jumps
 */
export const insideQuotes = (text: string, position: vscode.Position) => {
    const left = text.substring(0, position.character);
    const right = text.substring(position.character, text.length);
    if (left.includes("'") && right.includes("'")) {
        const l = left.split("'");
        return l[l.length - 1];
    } else {
        return null;
    }
};

export const isPathAbsolute = (path: string) => {
    return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
};