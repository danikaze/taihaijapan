function array<T>(...args: T[]): T[] {
  args.splice(args.length - 1, 1);

  return args;
}

export const helper = {
  fn: array,
  async: false,
};
