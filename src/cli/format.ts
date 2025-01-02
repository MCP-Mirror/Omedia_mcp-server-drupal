import { bold, green, red } from "@std/fmt/colors";

const Formatter = {
  error(err: unknown) {
    return `\n${bold(red("ERROR:"))} ${err}`;
  },
  info(msg: string) {
    return `\n${bold(green("INFO:"))} ${msg}`;
  },
};

export { Formatter };
