import * as React from "react";
import {
  StartEditConfig,
  RawSchema,
  ShowConfig,
  InsertConfig,
  Command
} from "../ext-src/extensionTypes";

type Props = {
  onStartEditing: (config: StartEditConfig, schema: RawSchema) => void;
  onShow: (config: ShowConfig, schema: RawSchema) => void;
  onInsert: (config: InsertConfig, schema: RawSchema) => void;
};

export function MessageHandler({ onStartEditing, onShow, onInsert }: Props) {
  React.useEffect(() => {
    const eventHandler = (event: any) => {
      const message = event.data;
      const schema: RawSchema = message.data.schema;
      const command: Command = message.data.config;

      switch (command.type) {
        case "startEditing":
          onStartEditing(command, schema);
          break;
        case "show":
          onShow(command, schema);
          break;
        case "insert":
          onInsert(command, schema);
          break;
      }
    };

    window.addEventListener("message", eventHandler);

    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, []);

  return null;
}
