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

export const minifyHtml = (html: string) => {
  return (
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
        const minifiedCss = css
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\s+/g, " ")
          .replace(/\s*([{}:;,>+~])\s*/g, "$1")
          .replace(/;}/g, "}")
          .trim();

        return `<style>${minifiedCss}</style>`;
      })

      .trim()
  );
};

export const beautifyHtml = (html: string) => {
  let formatted = "";
  let indent = 0;

  html = html.replace(/></g, ">\n<");

  const lines = html.split("\n");

  for (let line of lines) {
    line = line.trim();

    if (!line) continue;

    if (/^<\//.test(line)) {
      indent--;
    }

    formatted += "    ".repeat(Math.max(indent, 0)) + line + "\n";

    if (
      /^<[^!/][^>]*[^/]?>$/.test(line) &&
      !/^<(br|img|hr|meta|input|link)/i.test(line) &&
      !line.includes("</")
    ) {
      indent++;
    }
  }

  formatted = formatted.replace(/<style>([\s\S]*?)<\/style>/gi, (_, css) => {
    return `<style>\n${beautifyCss(css)}\n</style>`;
  });

  return formatted.trim();
};
