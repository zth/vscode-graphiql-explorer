import * as React from "react";
// @ts-ignore
import GraphiQL from "graphiql";
import { Webview } from "vscode";
// @ts-ignore
import GraphiQLExplorer from "graphiql-explorer";
// @ts-ignore
import StorageAPI from "graphiql/dist/utility/StorageAPI";
import "graphiql/graphiql.css";
import "./App.css";

import { MessageHandler } from "./MessageHandler";
import {
  GraphQLSource,
  StartEditConfig,
  Command,
  RawSchema,
  InsertConfig,
  ShowConfig
} from "../ext-src/extensionTypes";
import { restoreOperationPadding, prettify } from "./utils";
import {
  buildSchema,
  GraphQLSchema,
  buildClientSchema,
  IntrospectionQuery
} from "graphql";
import prettier from "prettier/standalone";
import parserGraphql from "prettier/parser-graphql";

declare function acquireVsCodeApi(): Webview;

class Storage {
  public setItem(key: string, value: string) {}
  public removeItem(key: string) {}
  public getItem(key: string): string | undefined {
    return;
  }
}

let storage = new Storage();

type State = {
  command: Command | null;
  error: Error | null;
  schema: GraphQLSchema | null;
  currentOperation: string | null;
  initialOperation: string | null;
  targetSource: GraphQLSource | null;
};

type Action =
  | { type: "reset" }
  | { type: "setShow"; command: ShowConfig; schema: GraphQLSchema }
  | { type: "setInsert"; command: InsertConfig; schema: GraphQLSchema }
  | { type: "prettifyOperation" }
  | { type: "setError"; error: Error | null }
  | { type: "setOperation"; operation: string }
  | { type: "setOperationFromExplorer"; operation: string }
  | {
      type: "setFromStartEvent";
      command: StartEditConfig;
      schema: GraphQLSchema;
      targetSource: GraphQLSource;
      initialOperation: string;
    };

let getEmptyState = (): State => ({
  error: null,
  schema: null,
  command: null,
  initialOperation: null,
  currentOperation: null,
  targetSource: null
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return getEmptyState();
    case "setError":
      return { ...state, error: action.error };
    case "prettifyOperation":
      return {
        ...state,
        currentOperation: state.currentOperation
          ? prettify(state.currentOperation)
          : state.currentOperation
      };
    case "setOperation":
      return {
        ...state,
        currentOperation: action.operation
      };
    case "setOperationFromExplorer":
      return {
        ...state,
        currentOperation: prettify(action.operation)
      };
    case "setFromStartEvent":
      return {
        command: action.command,
        error: null,
        schema: action.schema,
        targetSource: action.targetSource,
        initialOperation: action.initialOperation,
        currentOperation: prettify(action.initialOperation)
      };
    case "setShow":
      return {
        ...getEmptyState(),
        command: action.command,
        schema: action.schema
      };
    case "setInsert":
      return {
        ...getEmptyState(),
        command: action.command,
        schema: action.schema
      };
  }
}

function parseSchema(schema: RawSchema): GraphQLSchema {
  let processed: GraphQLSchema;

  if (schema.type === "json") {
    let parsed = JSON.parse(schema.content);

    if (parsed.data) {
      parsed = parsed.data;
    }

    processed = buildClientSchema(parsed as IntrospectionQuery);
  } else {
    processed = buildSchema(schema.content);
  }

  return processed;
}

function App() {
  let [state, dispatch] = React.useReducer(reducer, getEmptyState());

  let setupStartEdit = React.useCallback(
    (config: StartEditConfig, schema: RawSchema) => {
      try {
        const processed = parseSchema(schema);

        dispatch({
          type: "setFromStartEvent",
          schema: processed,
          command: config,
          initialOperation: config.source.content,
          targetSource: config.source
        });
      } catch (e) {
        dispatch({
          type: "setError",
          error: e
        });
      }
    },
    [dispatch]
  );

  let setupShow = React.useCallback(
    (config: ShowConfig, schema: RawSchema) => {
      try {
        const processed = parseSchema(schema);

        dispatch({
          type: "setShow",
          command: config,
          schema: processed
        });
      } catch (e) {
        dispatch({
          type: "setError",
          error: e
        });
      }
    },
    [dispatch]
  );

  let setupInsert = React.useCallback(
    (config: InsertConfig, schema: RawSchema) => {
      try {
        const processed = parseSchema(schema);

        dispatch({
          type: "setInsert",
          command: config,
          schema: processed
        });
      } catch (e) {
        dispatch({
          type: "setError",
          error: e
        });
      }
    },
    [dispatch]
  );

  let onEdit = React.useCallback(
    (newValue: string) => {
      dispatch({ type: "setOperation", operation: newValue });
    },
    [dispatch]
  );

  let onEditExplorer = React.useCallback(
    (newValue: string) => {
      dispatch({ type: "setOperationFromExplorer", operation: newValue });
    },
    [dispatch]
  );

  let vscode = React.useMemo(() => acquireVsCodeApi(), []);

  let save = () => {
    const { command } = state;

    if (!command) {
      return;
    }

    switch (command.type) {
      case "show": {
        cancel();
        break;
      }
      case "insert": {
        vscode.postMessage({
          command: "insert",
          position: command.position,
          content: state.currentOperation
        });
        break;
      }
      case "startEditing": {
        const { targetSource, initialOperation, currentOperation } = state;

        if (!targetSource || !currentOperation || !initialOperation) {
          dispatch({ type: "setError", error: new Error("Could not save.") });
        } else {
          vscode.postMessage({
            command: "save",
            targetSource,
            newContent:
              targetSource.type === "TAG"
                ? restoreOperationPadding(
                    prettify(currentOperation),
                    initialOperation
                  )
                : currentOperation
          });
        }
      }
    }
  };

  let cancel = () =>
    vscode.postMessage({
      command: "cancel"
    });

  React.useEffect(() => {
    let handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        save();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  const { command } = state;

  React.useEffect(() => {
    if (command) {
      switch (command.type) {
        case "startEditing": {
          const body = document.querySelector("body");
          if (body) {
            body.classList.remove("show-insertions");
          }
          break;
        }
        case "show":
        case "insert": {
          const body = document.querySelector("body");
          if (body) {
            body.classList.add("show-insertions");
          }
          break;
        }
      }
    }
  }, [command]);

  return (
    <div className="App">
      <MessageHandler
        onStartEditing={setupStartEdit}
        onShow={setupShow}
        onInsert={setupInsert}
      />
      {state.error ? <p>{state.error.message}</p> : null}
      {state.schema && command ? (
        <div className="graphiql-container">
          <GraphiQLExplorer
            schema={state.schema}
            query={state.currentOperation}
            onEdit={onEditExplorer}
            explorerIsOpen={true}
            showAttribution={true}
          />
          <GraphiQL
            schema={state.schema}
            query={state.currentOperation}
            onEditQuery={onEdit}
            storage={storage}
            fetcher={() => Promise.resolve({ data: null })}
          >
            <GraphiQL.Toolbar>
              <GraphiQL.Button
                onClick={() => dispatch({ type: "prettifyOperation" })}
                label="Prettify"
                title="Prettify"
              />
              {command.type === "show" ? null : (
                <GraphiQL.Button
                  onClick={save}
                  label="Save (Cmd/Ctrl + Enter)"
                  title="Save (Cmd/Ctrl + Enter)"
                />
              )}
              <GraphiQL.Button
                onClick={cancel}
                label={command.type === "show" ? "Close" : "Cancel (Esc)"}
                title={command.type === "show" ? "Close" : "Cancel (Esc)"}
              />
            </GraphiQL.Toolbar>
          </GraphiQL>
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
}

export default App;
