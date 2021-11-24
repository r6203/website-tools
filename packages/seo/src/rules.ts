import * as cheerio from "cheerio";

type KV = Record<string, any>;

type Status = "ok" | "warning" | "error";

export type Info = {
  key: string;
  status: Status;
  actual: KV;
  expected?: KV;
};

export interface Result {
  rule: string;
  info?: Info[];
}

export type Rule = (html: string) => Result;

export type Rules =
  | "title"
  | "h1"
  | "metaDescription"
  | "imageAlt"
  | "wordCount"
  | "language"
  | "charset"
  | "metaViewport"
  | "favicon";

// TODO make const automatically?
export const ruleNames: Record<Rules, string> = {
  title: "title",
  h1: "h1",
  metaDescription: "metaDescription",
  imageAlt: "imageAlt",
  wordCount: "wordCount",
  language: "language",
  charset: "charset",
  metaViewport: "metaViewport",
  favicon: "favicon",
};

const existsMultiple = (el: cheerio.Cheerio<cheerio.Element>) => {
  return el.length > 1;
};

export const checkTitle: Rule = (html) => {
  const $ = cheerio.load(html);
  const title = $("head > title");

  const titleText = title.text();
  const { length: titleLength } = titleText;

  const rule = ruleNames.title;
  const expected: KV = { from: 1, to: 60 };

  if (existsMultiple(title)) {
    return {
      rule,
      info: title
        .map(
          (_, el) =>
            ({
              key: "multiple",
              status: "error",
              expected,
              actual: {
                text: $(el).text(),
              },
            } as Info)
        )
        .get(),
    };
  }

  if (titleLength > 0 && titleLength < 70) {
    return {
      rule,
      info: [
        {
          status: "ok",
          key: "length",
          expected,
          actual: { length: titleLength, text: titleText },
        },
      ],
    };
  } else {
    return {
      rule,
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: titleLength, text: titleText },
          expected,
        },
      ],
    };
  }
};

export const checkH1: Rule = (html) => {
  const $ = cheerio.load(html);

  const h1 = $("h1");

  const rule = ruleNames.h1;
  const expected = { from: 1 };
  const { length: h1Length } = h1.text();

  if (existsMultiple(h1)) {
    return {
      rule,
      info: h1
        .map(
          (_, el) =>
            ({
              key: "multiple",
              status: "error",
              expected,
              actual: {
                text: $(el).text(),
              },
            } as Info)
        )
        .get(),
    };
  }

  if (h1Length === 0) {
    return {
      rule,
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: h1Length },
          expected,
        },
      ],
    };
  }

  return {
    rule,
    info: [
      {
        key: "length",
        status: "ok",
        actual: { length: h1Length },
        expected,
      },
    ],
  };
};

export const checkMetaDescription: Rule = (html) => {
  const $ = cheerio.load(html);

  const metaDescription = $('meta[name="description"]');

  const rule = ruleNames.metaDescription;
  const expected = { from: 1, to: 160 };

  const content = metaDescription.attr("content");
  const { length: descriptionLength } = content;

  if (existsMultiple(metaDescription)) {
    return {
      rule,
      info: metaDescription
        .map(
          (_, el) =>
            ({
              key: "multiple",
              status: "warning",
              expected,
              actual: {
                content: $(el).attr("content"),
              },
            } as Info)
        )
        .get(),
    };
  }

  if (descriptionLength > 0 && descriptionLength < 160) {
    return {
      rule,
      info: [
        {
          key: "length",
          status: "ok",
          actual: { length: descriptionLength, content },
          expected,
        },
      ],
    };
  } else {
    return {
      rule,
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: descriptionLength, content },
          expected,
        },
      ],
    };
  }
};

export const checkImageAlt: Rule = (html) => {
  const $ = cheerio.load(html);

  const image = $("img");

  const rule = ruleNames.imageAlt;
  const expected: KV = { from: 1, to: 125 };

  if (!image) {
    return {
      rule,
    };
  }

  const info: Info[] = [];

  image.map((_, el) => {
    const img = $(el);
    const altText = img.attr("alt");

    const length = altText ? altText.length : 0;

    if (length > 1 && length < 125) {
      info.push({
        key: "length",
        status: "ok",
        actual: { element: $.html(el), length },
        expected,
      });
    } else {
      info.push({
        key: "length",
        status: "warning",
        actual: { element: $.html(el), length },
        expected,
      });
    }
  });

  return { rule, info };
};

export const checkWordCount: Rule = (html) => {
  const $ = cheerio.load(html);

  const wordCount = $("body").contents().text().split(" ").length;

  return {
    rule: ruleNames.wordCount,
    info: [
      {
        key: "length",
        status: "ok",
        actual: { length: wordCount },
      },
    ],
  };
};

export const checkLanguage: Rule = (html) => {
  const $ = cheerio.load(html);

  const lang = $("html").attr("lang");
  const rule = ruleNames.language;

  if (lang.length === 0) {
    return {
      rule,
      info: [
        {
          key: "language",
          status: "warning",
          actual: { language: "" },
        },
      ],
    };
  }

  return {
    rule,
    info: [
      {
        key: "language",
        status: "ok",
        actual: { language: lang },
      },
    ],
  };
};

export const checkCharset: Rule = (html) => {
  const $ = cheerio.load(html);

  const meta = $("meta").filter(
    (_, el) =>
      $(el).attr("charset") !== undefined ||
      $(el).attr("content").includes("charset")
  );

  const rule = ruleNames.charset;

  const regx = /.*?charset=([^"']+)/;
  const match = regx.exec(meta.attr("content"));

  if (meta.length > 1) {
    return {
      rule,
      info: meta
        .map(
          (_, el) =>
            ({
              key: "multiple",
              status: "error",
              actual: { charset: $(el).attr("charset") || match[1] },
            } as Info)
        )
        .get(),
    };
  }

  if (meta.length === 0 || (meta.attr("charset")?.length === 0 && !match)) {
    return {
      rule,
      info: [
        {
          key: "charset",
          status: "warning",
          actual: { charset: "" },
        },
      ],
    };
  }

  return {
    rule,
    info: [
      {
        key: "charset",
        status: "ok",
        actual: { charset: meta.attr("charset") || match[1] },
      },
    ],
  };
};

export const checkMetaViewport: Rule = (html) => {
  const $ = cheerio.load(html);

  const viewport =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

  const expectedViewport: KV = {
    viewport,
  };

  const rule = ruleNames.metaViewport;

  const metaViewport = $('meta[name="viewport"]');

  if (existsMultiple(metaViewport)) {
    return {
      rule,
      info: metaViewport
        .map(
          (_, el) =>
            ({
              key: "multiple",
              status: "error",
              expected: expectedViewport,
              actual: {
                element: $.html(el),
              },
            } as Info)
        )
        .get(),
    };
  }

  const match = html.match(new RegExp(viewport));

  if (!match) {
    return {
      rule,
      info: [
        {
          key: "viewport",
          status: "warning",
          expected: expectedViewport,
          actual: { element: $.html('meta[name="viewport"]') },
        },
      ],
    };
  }

  return {
    rule,
    info: [
      {
        key: "viewport",
        status: "ok",
        expected: expectedViewport,
        actual: { element: match[0] },
      },
    ],
  };
};

export const checkFavicon: Rule = (html) => {
  const $ = cheerio.load(html);

  const links = $("link");
  const favicons = links.filter((_, el) => $(el).attr("rel").includes("icon"));

  const rule = ruleNames.favicon;

  if (favicons.length === 0) {
    return {
      rule,
      info: [
        {
          key: "missing",
          status: "warning",
          actual: {},
        },
      ],
    };
  }

  return {
    rule,
    info: [
      {
        key: "favicon",
        status: "ok",
        actual: {
          icons: favicons
            .map((_, el) => {
              const icon = $(el);

              return {
                href: icon.attr("href"),
                rel: icon.attr("rel"),
                sizes: icon.attr("sizes"),
              };
            })
            .get(),
          length: favicons.length,
        },
      },
    ],
  };
};
