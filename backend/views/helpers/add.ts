function add(first: string, ...args): string {
  let res = first;
  const n = args.length - 1;

  for (let i = 0; i < n; i++) {
    res = first + args[i];
  }

  return res;
}

export const helper = {
  fn: add,
  async: false,
};
