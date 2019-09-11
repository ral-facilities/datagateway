# DataGateway

TODO: project description

## Available Scripts

In the project directory, you can run:

### `npm install`

This will install all the top level project dependencies and then call `lerna bootstrap`,
which calls `npm install` for each package. This means that running `npm install` at the top
level intialises all the packages, and you will be ready to start development in any of them!

### `npx lerna add {package}`

Adds new packages. Use this instead of `npm install` in subfolders, as this will keep versions across
subrepos in sync. If you only want a dependency in one package, use the `--scope` flag.

```
npx lerna add my-package --scope=datagateway-table
```

Additionally, use the `--dev` flag to install as a devDependency

```
npx lerna add my-package --scope=datagateway-table --dev
```

See [https://github.com/lerna/lerna/tree/master/commands/add#readme](https://github.com/lerna/lerna/tree/master/commands/add#readme)

### `npm run datagateway-table`

Runs the `datagateway-table` `start` script, which runs the app in development mode
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Runs both unit tests and e2e tests for all packages

### `npm run test:unit`

Runs unit tests for all packages

### `npm run test:e2e`

Runs e2e tests for all packages

### `npm run lint`

Lints all packages

### `npm run tsc`

Runs `tsc` on all packages - currently this will re-build `datagateway-common`
