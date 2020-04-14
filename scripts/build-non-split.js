#!/usr/bin/env node

// Disables code splitting into chunks
// See https://github.com/facebook/create-react-app/issues/5306#issuecomment-433425838

const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
const CopyWebpackPlugin = require('copy-webpack-plugin');

let config = defaults.__get__("config");

config.optimization.splitChunks = {
  cacheGroups: {
    default: false
  }
};

config.optimization.runtimeChunk = false;

config.plugins.push(
  new CopyWebpackPlugin([
    {
      from: "./node_modules/graphql-voyager/dist/voyager.worker.js",
      to: "static/js"
    }
  ])
);
