# DataGateway

[![Build Status](https://github.com/ral-facilities/datagateway/workflows/CI%20Build/badge.svg?branch=master)](https://github.com/ral-facilities/datagateway/actions?query=workflow%3A%22CI+Build%22) [![codecov](https://codecov.io/gh/ral-facilities/datagateway/branch/master/graph/badge.svg)](https://codecov.io/gh/ral-facilities/datagateway)

DataGateway is a [ReactJs](https://reactjs.org/)-based web application that provides ways of discovering and accessing data produced at large-scale science facilities. DataGateway is
a [micro-frontend](https://micro-frontends.org/) that can be integrated with the parent web application [SciGateway](https://github.com/ral-facilities/scigateway).

DataGateway uses Yarn workspaces to manage it's monorepo structure, so please use [Yarn](https://yarnpkg.com/lang/en/docs/install/) instead of npm for package management.

The SciGateway application offers features such as authentication and authorisation functionality, notifications, cookies management. In this way, DataGateway relies on SciGateway for these overarching features, and can focus on providing data discoverability and downloads. The data is organised according to the data hierarchy that reflects the data pipelines in each facility. The data is shown in a tabular format depicting the main metadata fields.

For more details about the project's architecture, development guidelines and installation procedures, visit the [SciGateway documentation](https://github.com/ral-facilities/scigateway/wiki).

## Code structure

The project is structured as a monorepo. This means that the actual code packages are located under `/packages` - below is a description of each package:

- `datagateway-common` - This package contains common code and said code can be imported by the other packages. Code/components should go in here if
  the code/component is both reusable and expected to be used by more than one package. An example of this is the `Table` component, which is needed by
  multiple packages to implement their specific configuration of tables. Another example is the type definitions of ICAT entities, as these are not
  specific to any one plugin and are used by all for typing. An example of something that _can't_ go into `datagateway-common` are Redux connected
  components as Redux state is (currently) unique to each app.
- `datagateway-dataview` - This package contains all the functionality of the TopCAT Browse and My Data views. It displays configured tables for the facilities
  and provides the data to the tables via API calls.

### Available Scripts

In the project directory, you can run:

### `yarn install`

This will install all the project dependencies and then call `lerna bootstrap`,
which links the packages together. This means that running `yarn install` at the top
level initialises all the packages, and you will be ready to start development in any of them!

### `yarn workspace {workspace-name} add {package(s)} / yarn workspaces run add {package(s)}`

Adds new packages. Use the first command to add a package to a project at the top level.
Alternatively, you can also change directory to the plugin you're developing and run `yarn add {package(s)}` like normal.
Use the second command to add a package to all projects.

```
yarn workspace datagateway-dataview add loglevel
```

This will add the `loglevel` package to `datagateway-dataview`

```
yarn workspaces add loglevel
```

This will add the `loglevel` package to all packages.

Remember that you can use `--dev` to save as a devDependency instead of a regular dependency.

### `yarn datagateway-dataview`

Runs the `datagateway-dataview` `start` script, which runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Similarly, use `yarn datagateway-download` and `yarn datagateway-search` to run the datagateway-download and datagateway-search packages respectively.

### `yarn test`

Runs both unit tests and e2e tests for all packages

### `yarn test:unit`

Runs unit tests for all packages

### `yarn test:e2e`

Runs e2e tests for all packages

### `yarn lint`

Lints all packages

### `yarn tsc`

Runs `tsc` on all packages - currently this will re-build `datagateway-common`

