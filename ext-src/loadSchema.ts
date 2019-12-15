import { RawSchema, SchemaLoader } from "./extensionTypes";
import { loaders } from "./schemaLoaders";
import * as fs from "fs";
import { getGraphQLConfig } from "graphql-config";

export async function loadSchema(rootPath: string): Promise<RawSchema | null> {
  const filesInRoot = fs.readdirSync(rootPath);

  let rawSchema: RawSchema | null = null;

  for (let i = 0; i <= loaders.length - 1; i += 1) {
    let loaderResult = await loaders[i](rootPath, filesInRoot);

    if (loaderResult) {
      rawSchema = loaderResult;
      break;
    }
  }

  return rawSchema || null;
}
