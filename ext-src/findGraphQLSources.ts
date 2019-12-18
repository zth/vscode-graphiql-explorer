import { TextDocument, Uri } from "vscode";
import { getLocator, locate } from "locate-character";
import { GraphQLSource, GraphQLSourceFromTag } from "./extensionTypes";

/**
 * A helper for extracting GraphQL operations from source via a regexp.
 * It assumes that the only thing the regexp matches is the actual content,
 * so if that's not true for your regexp you probably shouldn't use this
 * directly.
 */
export let makeExtractTagsFromSource = (
  regexp: RegExp
): ((text: string) => Array<GraphQLSourceFromTag>) => (
  text: string
): Array<GraphQLSourceFromTag> => {
  const locator = getLocator(text);
  const sources: Array<GraphQLSourceFromTag> = [];
  let result;
  while ((result = regexp.exec(text)) !== null) {
    let start = locator(result.index);
    let end = locator(result.index + result[0].length);

    sources.push({
      type: "TAG",
      content: result[0],
      start: {
        line: start.line,
        character: start.column
      },
      end: {
        line: end.line,
        character: end.column
      }
    });
  }

  return sources;
};

export const jsGraphQLTagsRegexp = new RegExp(
  /(?<=(graphql|gql|graphql\.experimental)`)[.\s\S]+?(?=`)/g
);
export const reasonFileFilterRegexp = new RegExp(/(\[%(graphql|relay\.))/g);
export const reasonGraphQLTagsRegexp = new RegExp(
  /(?<=\[%(graphql|relay\.\w*)[\s\S]*{\|)[.\s\S]+?(?=\|})/gm
);

const extractGraphQLSourceFromJs = makeExtractTagsFromSource(
  jsGraphQLTagsRegexp
);

const extractGraphQLSourceFromReason = makeExtractTagsFromSource(
  reasonGraphQLTagsRegexp
);

export function extractGraphQLSources(
  languageId: string,
  document: string
): GraphQLSource[] | null {
  switch (languageId) {
    case "graphql":
      return [
        {
          type: "FULL_DOCUMENT",
          content: document
        }
      ];
    case "javascript":
    case "javascriptreact":
    case "typescript":
    case "typescriptreact":
    case "vue":
      return extractGraphQLSourceFromJs(document);
    case "reason":
      return extractGraphQLSourceFromReason(document);
    default:
      return null;
  }
}
