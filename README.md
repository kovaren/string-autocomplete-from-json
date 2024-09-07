# String Autocomplete from JSON

Code completion in strings based on a JSON, with simple configuration and no import of the JSON required.

The primary use case for this extension is localization JSON files like in [ngx-translate](http://www.ngx-translate.com/) but it can be used in other scenarios.

## Features

### Code completion

JSON key suggestions inside a string

### Go to definition

Press F12 or Ctrl+Click on a key inside a string to jump to the JSON file with its definition

### Find references

Press Shift+F12 on a key in a JSON file to find all files containing strings with that key

### Rename symbol

Press F2 on a JSON key to rename it everywhere (in the JSON completion source and in all references, no matter)

## Extension Settings

This extension contributes the following settings in **.vscode/settings.json**:

* `string-autocomplete.config`: mapping of JSON files and files to provide code completion in, where:
    * `sourcePath` is the path of the source JSON file. It can be either absolute or relative to workspace root directory.
    * `destinationPattern` is a Glob pattern of files to provide the code completion in.

For example:

```json
"string-autocomplete.config": [{
    "sourcePath": "src/assets/strings.json",
    "destinationPattern": "src/app/**/*.{tsx,ts,js,html}"
}, {
    "sourcePath": "src/assets/locale.json",
    "destinationPattern": "src/components/**/*.{tsx,ts}"
}]
```
