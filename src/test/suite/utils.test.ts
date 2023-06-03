import { Position } from 'vscode';
import * as Utils from '../../utils/utils';
import * as assert from 'assert';

suite('Utils test suite', () => {
    suite('extractTextInQuotes', () => {
        const testFunc = (text: string, wholeWord: boolean, cursorPosition: number, expectedResult: string | null) => {
            assert.strictEqual(Utils.extractTextInQuotes(text, new Position(0, cursorPosition), wholeWord), expectedResult);
        };

        suite('invalid string', () => {
            test('empty string', () => {
                const text = '';
                testFunc(text, false, 0, null);
            });

            test('string without quotes', () => {
                const text = 'The quick brown fox jumps over the lazy dog';
                testFunc(text, false, 0, null);
            });
        });
        
        suite('single quotes', () => {
            const text = "The quick brown 'fox.jumps.over' the lazy dog";

            test('outside quotes', () => {
                testFunc(text, false, 0, null);
                testFunc(text, false, 10, null);
                testFunc(text, false, 16, null);
                testFunc(text, false, 32, null);
                testFunc(text, false, 45, null);
            });
            test('inside quotes', () => {
                testFunc(text, false, 17, '');
                testFunc(text, false, 24, 'fox.jum');
                testFunc(text, true, 24, 'fox.jumps');
                testFunc(text, false, 31, 'fox.jumps.over');
            });
        });
        
        suite('double quotes', () => {
            const text = 'The quick brown "fox.jumps.over" the lazy dog';

            test('outside quotes', () => {
                testFunc(text, false, 0, null);
                testFunc(text, false, 10, null);
                testFunc(text, false, 16, null);
                testFunc(text, false, 32, null);
                testFunc(text, false, 45, null);
            });
            test('inside quotes', () => {
                testFunc(text, false, 17, '');
                testFunc(text, false, 24, 'fox.jum');
                testFunc(text, true, 24, 'fox.jumps');
                testFunc(text, false, 31, 'fox.jumps.over');
            });
        });
        
        suite('single and double quotes', () => {
            const text = 'The quick brown "fox.ju\'mps.over" the lazy dog';

            test('outside quotes', () => {
                testFunc(text, false, 0, null);
                testFunc(text, false, 10, null);
                testFunc(text, false, 16, null);
                testFunc(text, false, 33, null);
                testFunc(text, false, 46, null);
            });
            test('inside quotes', () => {
                testFunc(text, false, 17, '');
                testFunc(text, false, 25, 'fox.ju\'m');
                testFunc(text, true, 25, 'fox.ju\'mps');
                testFunc(text, false, 32, 'fox.ju\'mps.over');
            });
        });
    });
});
