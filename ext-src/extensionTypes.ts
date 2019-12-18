export type RawSchema = {
  content: string;
  type: "json" | "sdl";
};

export type SchemaLoader = (
  rootPath: string,
  filesInRoot: Array<string>
) => Promise<RawSchema | null>;

export type StartEditConfig = {
  type: "startEditing";
  source: GraphQLSource;
};

export type ShowConfig = {
  type: "show";
};

export type InsertConfig = {
  type: "insert";
  position: {
    line: number;
    character: number;
  };
};

export type Command = StartEditConfig | ShowConfig | InsertConfig;

type CursorPosition = {
  line: number;
  character: number;
};

export type GraphQLSourceFromFullDocument = {
  type: "FULL_DOCUMENT";
  content: string;
};

export type GraphQLSourceFromTag = {
  type: "TAG";
  content: string;
  start: {
    line: number;
    character: number;
  };
  end: {
    line: number;
    character: number;
  };
};

export type GraphQLSource =
  | GraphQLSourceFromFullDocument
  | GraphQLSourceFromTag;
