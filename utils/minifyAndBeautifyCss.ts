export const minifyCss = (css: string) => {
  return (
    css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>+~])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim()
  );
};

export const minifyStyleTags = (html: string) => {
  return html.replace(
    /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    (_, css) => `<style>${minifyCss(css)}</style>`,
  );
};

export const beautifyCss = (css: string) => {
  css = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  let result = "";
  let indent = 0;
  let inString = false;
  let quote = "";
  let prev = "";

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];

    if ((ch === '"' || ch === "'") && prev !== "\\") {
      if (!inString) {
        inString = true;
        quote = ch;
      } else if (quote === ch) {
        inString = false;
      }

      result += ch;
      prev = ch;
      continue;
    }

    if (inString) {
      result += ch;
      prev = ch;
      continue;
    }

    switch (ch) {
      case "{":
        indent++;
        result = result.trimEnd() + " {\n" + "    ".repeat(indent);
        break;

      case "}":
        indent--;
        result =
          result.trimEnd() +
          "\n" +
          "    ".repeat(Math.max(indent, 0)) +
          "}\n\n" +
          "    ".repeat(Math.max(indent, 0));
        break;

      case ";":
        result += ";\n" + "    ".repeat(indent);
        break;

      case ":":
        result += ": ";
        break;

      case ",":
        result += ", ";
        break;

      default:
        result += ch;
    }

    prev = ch;
  }

  return result
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const beautifyStyleTags = (html: string) =>
  html.replace(
    /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    (_, css) => `<style>\n${beautifyCss(css)}\n</style>`,
  );
