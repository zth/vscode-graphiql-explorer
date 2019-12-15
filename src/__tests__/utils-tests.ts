import {
  padOperation,
  prettify,
  findOperationPadding,
  restoreOperationPadding
} from "../utils";

describe("findOperationPadding", () => {
  it("should find padding of operation", () => {
    expect(
      findOperationPadding(`
    fragment Test on Test {
      id
      stuff
      here
    }`)
    ).toBe(4);

    expect(
      findOperationPadding(`
        fragment Test on Test {
          id
          stuff
          here
        }`)
    ).toBe(8);
  });
});

describe("restoreOperationPadding", () => {
  it("should restore operation padding properly", () => {
    const operation_1 = `
    fragment Test on Test {
      id
      stuff
      here
    }`;

    const operation_2 = `
    fragment Stuff on Stuff {
      id
      stuffers
      stuffies
    }
  `;

    expect(restoreOperationPadding(prettify(operation_1), operation_1)).toBe(
      operation_1
    );

    expect(restoreOperationPadding(prettify(operation_2), operation_2)).toBe(
      operation_2
    );
  });
});
