import { graphql_ppx_loader, rawSchemaFileLoader } from "../schemaLoaders";
jest.mock("fs");

const fs = require("fs");

describe("Schema loaders", () => {
  describe("graphql_ppx_loader", () => {
    it("finds and loads a graphql_schema.json file if present in root", async () => {
      const rootPath = "/home/someUser/someProject";

      fs.readFileSync.mockImplementation((p: string) =>
        p === rootPath + "/graphql_schema.json" ? "SCHEMA" : null
      );

      expect(
        await graphql_ppx_loader(rootPath, [
          "package.json",
          "graphql_schema.json"
        ])
      ).toEqual({
        type: "json",
        content: "SCHEMA"
      });
    });

    it("returns null if schema is not found", async () => {
      const rootPath = "/home/someUser/someProject";

      fs.readFileSync.mockImplementation((p: string) =>
        p === rootPath + "/graphql_schema.json" ? "SCHEMA" : null
      );

      expect(await graphql_ppx_loader(rootPath, ["package.json"])).toBe(null);
    });
  });

  describe("rawSchemaFileLoader", () => {
    it("finds and loads a schema.graphql file if present in root", async () => {
      const rootPath = "/home/someUser/someProject";

      fs.readFileSync.mockImplementation((p: string) =>
        p === rootPath + "/schema.graphql" ? "SCHEMA" : null
      );

      expect(
        await rawSchemaFileLoader(rootPath, ["package.json", "schema.graphql"])
      ).toEqual({
        type: "sdl",
        content: "SCHEMA"
      });
    });

    it("finds and loads a schema.json file if present in root", async () => {
      const rootPath = "/home/someUser/someProject";

      fs.readFileSync.mockImplementation((p: string) =>
        p === rootPath + "/schema.json" ? "SCHEMA" : null
      );

      expect(
        await rawSchemaFileLoader(rootPath, ["package.json", "schema.json"])
      ).toEqual({
        type: "json",
        content: "SCHEMA"
      });
    });

    it("returns null if schema is not found", async () => {
      const rootPath = "/home/someUser/someProject";

      fs.readFileSync.mockImplementation((p: string) =>
        p === rootPath + "/schema.graphql" ? "SCHEMA" : null
      );

      expect(await rawSchemaFileLoader(rootPath, ["package.json"])).toBe(null);
    });
  });
});
