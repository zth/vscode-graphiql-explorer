import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import ErrorBoundary from "react-error-boundary";
import "./index.css";

type FallbackProps = {
  error: Error | undefined;
  componentStack: Error | undefined;
};

const MyFallbackComponent: React.SFC<FallbackProps> = ({
  error
}: FallbackProps) => (
  <div>
    <p>
      <strong>Oops! An error occured!</strong>
    </p>
    <p>Here’s what we know…</p>
    <p>
      <strong>Error:</strong> {error ? error.toString() : ""}
    </p>
  </div>
);

ReactDOM.render(
  // @ts-ignore
  <ErrorBoundary FallbackComponent={MyFallbackComponent}>
    <App />
  </ErrorBoundary>,
  document.getElementById("root") as HTMLElement
);
