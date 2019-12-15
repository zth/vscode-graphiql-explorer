import { extractGraphQLSources } from "../findGraphQLSources";
import * as vscode from "vscode";

/**
 * Creates a simple source tester that takes a language id.
 */
let makeSourceTester = (source: string, expectedResult: any) => (
  languageId: string
) =>
  expect(
    extractGraphQLSources({
      getText: () => source,
      languageId
    } as vscode.TextDocument)
  ).toEqual(expectedResult);

/**
 * JS, TS and Vue
 */
describe("JS/TS", () => {
  test("JS/TS style sources", () => {
    /**
     * Since everything is regexp based, the only thing we need to
     * verify for JS/TS is that the regexp based extraction work for all
     * tags we want to support.
     */
    const jsTsStyleSource = `
import someThing from "someModule";

let query = gql\`
  query SomeQuery {
      viewer {
          id
      }
  }
\`;

type Props = {
    someStuff: boolean
};

export const SomeComponent: React.SFC<Props> = (props) => {
    const queryResult = useQuery<SomeType>(graphql\`
        query AnotherQuery {
            viewer {
                petCount
            }
        }
    \`);

    return <div>{queryResult.status}</div<;
};
`;

    const expectedResult = [
      {
        content: `
  query SomeQuery {
      viewer {
          id
      }
  }
`,
        start: { character: 16, line: 3 },
        end: { character: 0, line: 9 },
        type: "TAG"
      },
      {
        content: `
        query AnotherQuery {
            viewer {
                petCount
            }
        }
    `,
        start: { character: 51, line: 16 },
        end: { character: 4, line: 22 },
        type: "TAG"
      }
    ];

    let testLanguageId = makeSourceTester(jsTsStyleSource, expectedResult);

    testLanguageId("javascript");
    testLanguageId("javascriptreact");
    testLanguageId("typescript");
    testLanguageId("typescriptreact");
    testLanguageId("vue");
  });
});

/**
 * Full GraphQL documents.
 */
describe("Full GraphQL document", () => {
  test("Full document", () => {
    const fullDocument = `
type SomeType {
    id: String!
};`;
    let testLanguageId = makeSourceTester(fullDocument, [
      {
        content: `
type SomeType {
    id: String!
};`,
        type: "FULL_DOCUMENT"
      }
    ]);

    testLanguageId("graphql");
  });
});

/**
 * ReasonML
 */
describe("ReasonML", () => {
  test("Both Relay and graphql_ppx style tags", () => {
    const fullDocument = `
module SomeQuery = [%graphql 
  {|
  query SomeQuery {
      viewer {
          id
      }
  }
  |}
];

module Fragment = [%relay.fragment
  {|
  fragment Avatar_user on User {
    avatarUrl
    fullName
  }
|}
];

[@react.component]
let make = (~ref) => {
    let fragmentData = Fragment.use(ref);
    let queryData = SomeQuery.use();
    React.null;
};
`;
    let testLanguageId = makeSourceTester(fullDocument, [
      {
        content: `
  query SomeQuery {
      viewer {
          id
      }
  }
  `,
        start: { character: 4, line: 2 },
        end: { character: 2, line: 8 },
        type: "TAG"
      },
      {
        content: `
  fragment Avatar_user on User {
    avatarUrl
    fullName
  }
`,
        start: { character: 4, line: 12 },
        end: { character: 0, line: 17 },
        type: "TAG"
      }
    ]);

    testLanguageId("reason");
  });
});
