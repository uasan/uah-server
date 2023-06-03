export let INDEX = 0;

export const LIST = [];
export const TREE = new Map();

const createNode = (target = null) => ({
  target,
  index: ++INDEX,
  children: new Map(),
});

export const makeParent = ({ parents = {} }) => {
  const path = [];
  const names = Object.keys(parents);
  const tests = Object.values(parents);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const parentPath = test.parent.path;

    test.count++;

    for (let p = 0; p < parentPath.length; p++)
      if (path.includes(parentPath[p]) === false) path.push(parentPath[p]);

    if (path.includes(test) === false) path.push(test);
  }

  return { deep: path.length, path, names, tests };
};

const sortList = (a, b) =>
  a.parent.deep === b.parent.deep
    ? a.count === b.count
      ? a.index - b.index
      : b.count - a.count
    : b.parent.deep - a.parent.deep;

const sortPath = (a, b) =>
  a.parent.path.includes(b)
    ? 1
    : a.count === b.count
    ? a.index - b.index
    : b.count - a.count;

const appendNode = test => {
  if (test.stack) return;

  let tree = TREE;
  const { path } = test.parent;

  if (test.parent.tests.length) {
    path.sort(sortPath);

    for (let node, i = 0; i < path.length; i++) {
      const key = path[i];

      if (tree.has(key)) {
        node = tree.get(key);
      } else {
        node = createNode(++key.stack === 1 ? key : null);
        tree.set(key, node);
      }

      tree = node.children;
    }
  }

  test.stack++;
  tree.set(test, createNode(test));

  //console.log([...path, test].map(test => test.index).join(' -> '));
};

export const makeTree = () => {
  LIST.sort(sortList);

  for (let i = 0; i < LIST.length; i++) appendNode(LIST[i]);
};

export const getParentResult = ({ tests, names }) => {
  const result = {};
  for (let i = 0; i < tests.length; i++) result[names[i]] = tests[i].result;
  return result;
};
