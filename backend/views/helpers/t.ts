function t(key: string) {
  return this.t(key);
}

export const helper = {
  fn: t,
  async: false,
};
