const BEAUTIFIER_ATTRIBUTE = "data-json-beautifier";
const WRAPPER_ATTRIBUTE = "data-json-beautifier-wrapper";
const BUTTON_ATTRIBUTE = "data-json-beautifier-button";
const CONTENT_ATTRIBUTE = "data-json-beautifier-content";

const parseHtml = (html: string) => {
  if (typeof DOMParser === "undefined") {
    return null;
  }

  return new DOMParser().parseFromString(html, "text/html");
};

const removeBeautifierElements = (document: Document) => {
  document
    .querySelectorAll(`[${BUTTON_ATTRIBUTE}], style[${BEAUTIFIER_ATTRIBUTE}], script[${BEAUTIFIER_ATTRIBUTE}]`)
    .forEach((element) => element.remove());

  document.querySelectorAll(`[${CONTENT_ATTRIBUTE}]`).forEach((element) => {
    element.removeAttribute(CONTENT_ATTRIBUTE);
  });

  document.querySelectorAll(`[${WRAPPER_ATTRIBUTE}]`).forEach((wrapper) => {
    wrapper.replaceWith(...Array.from(wrapper.childNodes));
  });
};

export const removeJsonBeautifierFromHtml = (html: string) => {
  const document = parseHtml(html);
  if (!document) {
    return html;
  }

  removeBeautifierElements(document);
  return document.body.innerHTML;
};

export const addJsonBeautifierToHtml = (html: string) => {
  const document = parseHtml(html);
  if (!document) {
    return html;
  }

  removeBeautifierElements(document);

  const codeBlocks = Array.from(document.body.querySelectorAll("pre, code")).filter(
    (block) => block.tagName === "PRE" || !block.closest("pre"),
  );
  let jsonBlockCount = 0;

  codeBlocks.forEach((renderedBlock) => {
    const contentBlock = renderedBlock.tagName === "PRE"
      ? renderedBlock.querySelector("code") || renderedBlock
      : renderedBlock;
    const json = contentBlock.textContent?.trim();

    if (!json) {
      return;
    }

    try {
      JSON.parse(json);
    } catch {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "json-beautifier";
    wrapper.setAttribute(WRAPPER_ATTRIBUTE, "");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "json-beautifier-button";
    button.setAttribute(BUTTON_ATTRIBUTE, "");
    button.textContent = "Beautify JSON";

    contentBlock.setAttribute(CONTENT_ATTRIBUTE, "");
    renderedBlock.parentNode?.insertBefore(wrapper, renderedBlock);
    wrapper.append(renderedBlock, button);
    jsonBlockCount += 1;
  });

  if (jsonBlockCount === 0) {
    return document.body.innerHTML;
  }

  const style = document.createElement("style");
  style.setAttribute(BEAUTIFIER_ATTRIBUTE, "");
  style.textContent = `
    .json-beautifier { position: relative; margin-top: 10px; }
    .json-beautifier-button {
      position: absolute;
      top: -34px;
      right: 12px;
      z-index: 1;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.9);
      color: #f8fafc;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1;
      padding: 8px 12px;
    }
    .json-beautifier-button:hover { background: #1e293b; }
    .json-beautifier pre { overflow: auto; white-space: pre; }
  `;

  const script = document.createElement("script");
  script.setAttribute(BEAUTIFIER_ATTRIBUTE, "");
  script.textContent = `
    (function () {
      if (window.__jsonBeautifierInstalled) return;
      window.__jsonBeautifierInstalled = true;
      document.addEventListener("click", function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;
        var button = target.closest("[data-json-beautifier-button]");
        if (!button) return;
        var wrapper = button.closest("[data-json-beautifier-wrapper]");
        var code = wrapper && wrapper.querySelector("[data-json-beautifier-content]");
        if (!code) return;
        try {
          code.textContent = JSON.stringify(JSON.parse(code.textContent || ""), null, 2);
          button.textContent = "JSON Beautified";
        } catch (error) {
          button.textContent = "Invalid JSON";
        }
      });
    })();
  `;

  document.body.append(style, script);
  return document.body.innerHTML;
};
