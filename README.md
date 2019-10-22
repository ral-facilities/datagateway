# DataGateway

DataGateway is a [ReactJs](https://reactjs.org/)-based web application that provides ways of discovering and accessing data produced at large-scale science facilities. DataGateway is 
a [micro-frontend](https://micro-frontends.org/) that can be integrated with the parent web application [SciGateway](https://github.com/ral-facilities/scigateway). 

The SciGateway application offers features such as authentication and authorisation functionality, notifications, cookies management. In this way, DataGateway relies on SciGateway for these overarching features, and can focus on providing data discoverability and downloads. The data is organised according to the data hierarchy that reflects the data pipelines in each facility. The data is shown in a tabular format depicting the main metadata fields. 

For more details about the project's architecture, development guidelines and installation procedures, visit the [SciGateway documentation](https://github.com/ral-facilities/scigateway/wiki). 

## Code structure

The project is structured as a monorepo. This means that the actual code packages are located under `/packages` - below is a description of each package:

- `datagateway-common` - This package contains common code and said code can be imported by the other packages. Code/components should go in here if
  the code/component is both reusable and expected to be used by more than one package. An example of this is the `Table` component, which is needed by
  multiple packages to implement their specific configuration of tables. Another example is the type definitions of ICAT entities, as these are not
  specific to any one plugin and are used by all for typing. An example of something that _can't_ go into `datagateway-common` are Redux connected
  components as Redux state is (currently) unique to each app.
- `datagateway-table` - This package contains all the functionality of the TopCAT Browse and My Data views. It displays configured tables for the facilities
  and provides the data to the tables via API calls.

### Available Scripts

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
