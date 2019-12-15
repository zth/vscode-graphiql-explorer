# vscode-graphiql-explorer

Use GraphiQL + GraphiQL Explorer to build your GraphQL operations, right from inside of VSCode.

![Demo](https://github.com/zth/vscode-graphiql-explorer/blob/master/images/vscode-graphiql-explorer.gif?raw=true)

## Features

- Explore your schema and edit + insert GraphQL operations using GraphiQL Explorer conveniently right from VSCode.
- Supports:
  - `graphql` and `gql` tags in JavaScript/TypeScript/Vue
  - `[%graphql]` and `[%relay]` nodes in ReasonML
  - Plain `.graphql` files
  - ...easy to add support for more languages and frameworks
- Explore your schema using GraphiQL right from VSCode.

## Setup

`vscode-graphiql-explorer` needs a file with your introspected schema in it, either a `.json` or a `.graphql` file. It tries to find your schema file by looking in the workspace root for:

1. A `.graphqlconfig` file containing a `{ "schemaPath": "/path/to/schema.graphql" }`.
2. `schema.graphql`, `schema.json` or `graphql_schema.json`.

If your schema is located somewhere other than the workspace root, please add and configure a `.graphqlconfig` file pointing to the schema, as described above.

If you don't have a schema file, you can create one by running `npx get-graphql-schema http://url/to/your/graphql/endpoint > schema.graphql` in your project root.
