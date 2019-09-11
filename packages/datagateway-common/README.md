# datagateway-common

A library containint common code and components for the DataGateway project.
It is a dependency of other packages in the repo and other apps can import code from it
like normal.

When adding new components/functions/definitions/constants etc., you must export the item
in `index.tsx` so that it will be importable from other applications.

e.g.

In `some_file.tsx`

```
export const my_const = 1;
```

In `index.tsx`

```
export { my_const } from 'some_file.tsx'
export { my_const };
```

If you export a lot of items in `some_file.tsx` and want to export all of them to be exposed to other packages
then the following syntax can be used instead

`index.tsx`

```
export * from 'some_file.tsx'
```

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs dependencies for `datagateway-common` only. Should normally use `npx lerna add` at the
top level, but can use regular `npm install` if it's only used by `datagateway-common` and not other
packages.

### `npm start`

Runs the app in development mode
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

In order to begin local development, you should uncomment the lines in `index.tsx`.
These allow the app to load like a regular React app rather than behave as a library.

### `npm run tsc`

Runs the Typescript compiler that converts our Typescript files into a Javascript library
that can be imported by our other packages. When making changes to this app, you must run
this to see the changes reflected in other apps. Think of it as a build step like `npm run build`.

### `npm test`

Runs unit tests

### `npm run test:watch`

Runs unit tests in watch mode, allowing you to filter which tests to run and automatically restart tests on code changes.

### `npm run lint:js`

Lints the `src` folder
