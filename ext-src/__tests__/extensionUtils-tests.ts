import { extractSelectedOperation } from "../extensionUtils";

describe("extractSelectedOperation", () => {
  const mockOperation = `
/**
 * Some comment
 */

const query = graphql\`
  query SomeQuery {
    viewer {
      id
    }
  }
\`;

/**
 * Some comment
 */

const fragment = graphql\`
  fragment SomeFragment on Viewer {
    id
  }
\`;`;

  it("should find the tag that's currently highlighted by the cursor position", () => {
    expect(
      extractSelectedOperation("javascript", mockOperation, {
        line: 9,
        character: 8
      })
    ).toEqual({
      content: `
  query SomeQuery {
    viewer {
      id
    }
  }
`,
      end: { character: 0, line: 11 },
      start: { character: 22, line: 5 },
      type: "TAG"
    });

    expect(
      extractSelectedOperation("javascript", mockOperation, {
        line: 20,
        character: 6
      })
    ).toEqual({
      content: `
  fragment SomeFragment on Viewer {
    id
  }
`,
      end: { character: 0, line: 21 },
      start: { character: 25, line: 17 },
      type: "TAG"
    });
  });

  it("should return null when cursor is not in any tag", () => {
    expect(
      extractSelectedOperation("javascript", mockOperation, {
        line: 14,
        character: 0
      })
    ).toEqual(null);
  });
});
