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

const protectCodeBlocks = (html: string) => {
  const codeBlocks: string[] = [];

  const protectedHtml = html.replace(
    /<code\b([^>]*)>([\s\S]*?)<\/code>/gi,
    (_, attributes, content) => {
      const index = codeBlocks.length;

      let code = content;

      // If code is already converted to code-line spans,
      // don't convert it again on second/third save.
      const alreadyConverted =
        /<span\b[^>]*class=["'][^"']*\bcode-line\b[^"']*["'][^>]*>/i.test(
          code
        );

      if (!alreadyConverted) {
        // Normalize editor generated HTML
        code = code
          // <br> => newline
          .replace(/<br\s*\/?>/gi, "\n")

          // <p>line</p> => line + newline
          .replace(/<p\b[^>]*>/gi, "")
          .replace(/<\/p>/gi, "\n")

          // Remove only first/last newline
          .replace(/^\r?\n/, "")
          .replace(/\r?\n$/, "");

        // Convert every line into span
        const lines = code.split(/\r?\n/);

        code = lines
          .map((line: any) => {
            return `<span class="code-line">${line}</span>`;
          })
          .join("");
      }

      codeBlocks.push(
        `<code${attributes}>${code}</code>`
      );

      return `___CODE_BLOCK_${index}___`;
    }
  );

  return {
    html: protectedHtml,

    restore: (value: string) => {
      return value.replace(
        /___CODE_BLOCK_(\d+)___/g,
        (_, index) => codeBlocks[Number(index)]
      );
    },
  };
};

export const minifyHtml = (html: string) => {
  const protectedCode = protectCodeBlocks(html);

  let result = protectedCode.html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(
      /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
      (_, css) => {
        const minifiedCss = css
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\s+/g, " ")
          .replace(/\s*([{}:;,>+~])\s*/g, "$1")
          .replace(/;}/g, "}")
          .trim();

        return `<style>${minifiedCss}</style>`;
      }
    )
    .trim();

  return protectedCode.restore(result);
};

export const beautifyHtml = (html: string) => {
  const protectedCode = protectCodeBlocks(html);

  html = protectedCode.html;

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

    formatted +=
      "    ".repeat(Math.max(indent, 0)) +
      line +
      "\n";

    if (
      /^<[^!/][^>]*[^/]?>$/.test(line) &&
      !/^<(br|img|hr|meta|input|link)/i.test(line) &&
      !line.includes("</")
    ) {
      indent++;
    }
  }

  formatted = formatted.replace(
    /<style>([\s\S]*?)<\/style>/gi,
    (_, css) => {
      return `<style>\n${beautifyCss(css)}\n</style>`;
    }
  );

  return protectedCode.restore(formatted).trim();
};
