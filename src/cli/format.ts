import { bold, red } from "@std/fmt/colors";

const Formatter = {
  error(err: unknown) {
    return `\n${bold(red("ERROR:"))} ${err}`;
  },
};

export { Formatter };
