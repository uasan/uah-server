import { Reporter } from './reporter.js';

const compareParents = ({ meta: a }, { meta: b }) =>
  a.level - b.level || a.id - b.id;

export class MetaLink {
  id = 0;
  level = 0;

  url = '';
  name = '';

  parents = null;
  parentKeys = null;
  parentClasses = null;

  constructor(test, url, parents) {
    this.url = url;
    this.id = test.list.push(test);
    this.name = test.name.endsWith('Test') ? test.name.slice(0, -4) : test.name;

    if (parents) {
      this.parents = [];
      this.parentKeys = Object.keys(parents);
      this.parentClasses = Object.values(parents);

      for (const parent of this.parentClasses) {
        if (parent.meta.parents) {
          for (const ancestor of parent.meta.parents) {
            if (this.parents.includes(ancestor) == false) {
              this.parents.push(ancestor);
            }
          }
        }
        if (this.parents.includes(parent) == false) {
          this.parents.push(parent);
        }
      }

      this.level = this.parents.sort(compareParents).length;

      // if (this.level > 1) {
      //   for (const node of this.parents) {
      //     for (const parent of this.parents) {
      //       if (parent !== node && parent.meta.level === node.meta.level) {
      //         console.log('SIBLING', node.name, parent.name);

      //         node.meta.siblings ??= new Set();
      //         node.meta.siblings.add(parent.meta);

      //         parent.meta.siblings ??= new Set();
      //         parent.meta.siblings.add(node.meta);
      //       }
      //     }
      //   }
      //   this.parents;
      // }
    }
  }

  getPayload(results) {
    if (this.parents) {
      const payload = {};

      for (let i = 0; i < this.parentKeys.length; i++) {
        payload[this.parentKeys[i]] = results.get(this.parentClasses[i].meta);
      }

      return payload;
    }
  }
}

class LevelSorter extends Map {
  count = 1;

  upsert(a, b) {
    if (this.has(a)) {
      const stats = this.get(a);

      stats.count++;
      stats.set(b, (stats.get(b) ?? 0) + 1);
    } else {
      this.set(a, new LevelSorter().set(b, 1));
    }
  }

  compare(a, b) {
    const stats = this.get(a);

    return -1; // stats.get(b) - stats.count;
  }

  static make(list) {
    const map = new this();

    for (let i = 0; i < list.length; i++) {
      const { parents } = list[i].meta;

      if (parents) {
        for (let i = 0; i < parents.length; ) {
          const a = parents[i];
          const b = parents[++i];

          if (a.meta.level === b?.meta.level) {
            map.upsert(a, b);
            map.upsert(b, a);
          }
        }
      }
    }

    // console.log({
    //   [a.name]: stats.count,
    //   [b.name]: stats.get(b),
    //   size: stats.size,
    //   all: [...stats.keys()].map(c => c.name).join(', '),
    // });

    // console.log(
    //   Object.fromEntries(
    //     map.entries().map(([c, v]) => [c.name, Object.fromEntries([...v.entries()].map(([c, v]) => [c.name, v]))]),
    //   ),
    // );

    return (a, b) => a.meta.level - b.meta.level || map.compare(a, b);
  }
}

export class Tree extends Map {
  children = null;

  constructor(children) {
    super().children = children;
  }

  add(Test, used) {
    const test = new Test();
    const tree = new Tree(test.children);

    used.add(Test);
    this.set(Test, tree).children.push(test);

    return tree;
  }

  static make(list) {
    const used = new Set();
    const tree = new this([]);
    const sort = LevelSorter.make(list);

    for (let i = list.length; i--; ) {
      const test = list[i];

      if (used.has(test)) {
        continue;
      }

      if (test.meta.parents) {
        let nodes = tree;

        for (const parent of test.meta.parents.sort(sort)) {
          nodes = nodes.get(parent) ?? nodes.add(parent, used);
        }

        nodes.add(test, used);
      } else {
        tree.children.push(new test());
      }
    }

    // console.log('ALL', list.length, 'CALL', showTree(tree.children));

    return tree.children;
  }
}
