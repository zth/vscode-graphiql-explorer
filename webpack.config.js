const path = require("path");

const isProd = process.env.NODE_ENV === "production";

const config = {
  target: "node",
  entry: "./ext-src/extension.ts",
  output: {
    path: path.resolve(__dirname, "build", "ext-src"),
    filename: "extension.js",
    libraryTarget: "commonjs2"
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode",
    encoding: "encoding",
    "import-fresh": "import-fresh"
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: require.resolve("./tsconfig.extension.json"),
              compilerOptions: {
                module: "es6"
              }
            }
          }
        ]
      }
    ]
  }
};

module.exports = config;
