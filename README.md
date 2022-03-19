# Github Action: Validate JSON
A GitHub Action that validates JSON files based on a JSON Schema.

This project uses [`ajv`](https://github.com/epoberezkin/ajv), fast JSON schema validator, to perform the validation. 

## Usage

### Inputs

- `schema`: A relative file path under the repository or a URL of a JSON schema file to validate the other JSON files with. Default is: `./schema.json`.
- `jsons`: One or more relative file paths under the repository of the JSON files to validate with the schema provided.
- `separator`: The separator that is used on `jsons` to separate each file. Default is `\n`.

### Outputs

- `invalid`: One or more of relative file paths of the invalid JSON files, found in the repository (seperated by newline).

### Example Workflow

An example `.github/workflows/validate.yml` workflow to run JSON validation on the repository: 

```yaml
name: Validate JSONs

on: [pull_request]

jobs:
  verify-json-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Validate JSON
        uses: ScratchAddons/validate-json-action@master
        env:
          schema: path/to/schema.json
          jsons: |
            path/to/file.json
            path/to/another/file.json
          separator: '\n'
```


<!-- ## TODOs

- [x] Initial validation action
- [x] Docker
- [ ] Automate release process
- [ ] Github workflow screenshots
- [ ] Support `exclude` & `include` in PRs (JSONs from pattern)
- [ ] Support `schema` & `jsons` by external reference (from S3/GitHub/etc...)
- [ ] Support `delimiter` input  -->