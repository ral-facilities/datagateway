# datagateway-common

A library containing common code and components for the DataGateway project.
It is a dependency of other packages in the repo and other apps can import code from it
like normal.

When adding new components/functions/definitions/constants etc., you must export the item
in `index.tsx` so that it will be importable from other applications from `datagateway-common`.

e.g.

In `some-file.tsx`

```
export const myConst = 1;
```

In `index.tsx`

```
export { myConst } from 'some-file.tsx';
```

If you export a lot of items in `some-file.tsx` and want to export all of them to be exposed to other packages
then the following syntax can be used instead

`index.tsx`

```
export * from 'some-file.tsx';
```

If wou have something as a default export, you can export it in `index.tsx` like so:

`myComponent.tsx`

```
const MyComponent: React.FC = () => <div>My component!</div>;
export default MyComponent;
```

`index.tsx`

```
export { default as myComponent } from `./myComponent.tsx`
```

If you like, you could also just export from the file it lives in and reference the path directly
when importing. This way would mean you wouldn't have to export again in `index.tsx`, but you probably
should in case someone tries to import from `datagateway-common` instead of the full path.

```
import { myConst } from 'datagateway-common/lib/some-file';
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in development mode
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

In order to begin local development, you should uncomment the lines in `index.tsx`.
These allow the app to load like a regular React app rather than behave as a library.

### `yarn tsc`

Runs the Typescript compiler that converts our Typescript files into a Javascript library
that can be imported by our other packages. When making changes to this app, you must run
this to see the changes reflected in other apps. Think of it as a build step like `yarn build`.

### `yarn test`

Runs unit tests

### `yarn test:watch`

Runs unit tests in watch mode, allowing you to filter which tests to run and automatically restart tests on code changes.

### `yarn lint:js`

Lints the `src` folder
