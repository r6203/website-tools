import {
  checkCharset,
  checkFavicon,
  checkH1,
  checkImageAlt,
  checkLanguage,
  checkMetaDescription,
  checkMetaViewport,
  checkTitle,
  checkWordCount,
} from "./rules";

describe("seo", () => {
  it("checks for title", () => {
    const html = (title: string) =>
      `<html><head><title>${title}</title></head><body></body></html>`;

    const expectedLength = { from: 1, to: 60 };

    expect(checkTitle(html("Foo"))).toEqual({
      rule: "title",
      info: [
        {
          key: "length",
          status: "ok",
          actual: {
            length: 3,
            text: "Foo",
          },
          expected: expectedLength,
        },
      ],
    });

    expect(checkTitle(html("A".repeat(69)))).toEqual({
      rule: "title",
      info: [
        {
          key: "length",
          status: "ok",
          actual: { length: 69, text: "A".repeat(69) },
          expected: expectedLength,
        },
      ],
    });

    expect(checkTitle(html("A".repeat(70)))).toEqual({
      rule: "title",
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: 70, text: "A".repeat(70) },
          expected: expectedLength,
        },
      ],
    });

    expect(checkTitle(html(""))).toEqual({
      rule: "title",
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: 0, text: "" },
          expected: expectedLength,
        },
      ],
    });

    expect(
      checkTitle(
        "<html><head><title>Foo</title><title>Bar</title></head><body></body></html>"
      )
    ).toEqual({
      rule: "title",
      info: [
        {
          key: "multiple",
          status: "error",
          expected: expectedLength,
          actual: { text: "Foo" },
        },
        {
          key: "multiple",
          status: "error",
          expected: expectedLength,
          actual: { text: "Bar" },
        },
      ],
    });

    expect(
      checkTitle(
        "<html><head></head><body><span><title>Foo</title></span></body></html>"
      )
    ).toEqual({
      rule: "title",
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: 0, text: "" },
          expected: expectedLength,
        },
      ],
    });
  });

  it("checks for h1", () => {
    const html = (h1: string) =>
      `<html><head></head><body>${
        h1 ? "<h1>" + h1 + "</h1>" : ""
      }</body></html>`;

    const expectedLength = { from: 1 };

    expect(checkH1(html("Foo"))).toEqual({
      rule: "h1",
      info: [
        {
          key: "length",
          status: "ok",
          actual: { length: 3 },
          expected: expectedLength,
        },
      ],
    });

    expect(checkH1(html(""))).toEqual({
      rule: "h1",
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: 0 },
          expected: expectedLength,
        },
      ],
    });

    expect(
      checkH1("<html><head></head><body><h1>Foo</h1><h1>Bar</h1></body></html>")
    ).toEqual({
      rule: "h1",
      info: [
        {
          key: "multiple",
          status: "error",
          expected: expectedLength,
          actual: { text: "Foo" },
        },
        {
          key: "multiple",
          status: "error",
          expected: expectedLength,
          actual: { text: "Bar" },
        },
      ],
    });
  });

  it("checks for meta description", () => {
    const html = (description: string) =>
      `<html><head><meta name="description" content="${description}"/></head><body></body></html>`;

    const expectedLength = { from: 1, to: 160 };

    expect(checkMetaDescription(html("Foo"))).toEqual({
      rule: "metaDescription",
      info: [
        {
          key: "length",
          status: "ok",
          actual: { length: 3, content: "Foo" },
          expected: expectedLength,
        },
      ],
    });

    expect(checkMetaDescription(html("A".repeat(159)))).toEqual({
      rule: "metaDescription",
      info: [
        {
          key: "length",
          status: "ok",
          actual: { length: 159, content: "A".repeat(159) },
          expected: expectedLength,
        },
      ],
    });

    expect(checkMetaDescription(html("A".repeat(160)))).toEqual({
      rule: "metaDescription",
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: 160, content: "A".repeat(160) },
          expected: expectedLength,
        },
      ],
    });

    expect(checkMetaDescription(html(""))).toEqual({
      rule: "metaDescription",
      info: [
        {
          key: "length",
          status: "warning",
          actual: { length: 0, content: "" },
          expected: expectedLength,
        },
      ],
    });

    expect(
      checkMetaDescription(
        '<html><head><meta name="description" content="Foo" /><meta name="description" content="Bar" />'
      )
    ).toEqual({
      rule: "metaDescription",
      info: [
        {
          key: "multiple",
          status: "warning",
          expected: expectedLength,
          actual: { content: "Foo" },
        },
        {
          key: "multiple",
          status: "warning",
          expected: expectedLength,
          actual: { content: "Bar" },
        },
      ],
    });
  });

  it("checks for image alt texts", () => {
    const html = (alt: string) =>
      `<html><head></head><body><img src="foo.jpg" alt="${alt}"></body></html>`;

    const expectedLength = { from: 1, to: 125 };

    expect(checkImageAlt(html("Foo"))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "ok",
          actual: {
            element: '<img src="foo.jpg" alt="Foo">',
            length: 3,
          },
          expected: expectedLength,
        },
      ],
    });

    expect(checkImageAlt(html("A".repeat(124)))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "ok",
          actual: {
            element: `<img src="foo.jpg" alt="${"A".repeat(124)}">`,
            length: 124,
          },
          expected: expectedLength,
        },
      ],
    });

    expect(checkImageAlt(html("A".repeat(125)))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "warning",
          actual: {
            element: `<img src="foo.jpg" alt="${"A".repeat(125)}">`,
            length: 125,
          },
          expected: expectedLength,
        },
      ],
    });

    expect(checkImageAlt(html(""))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "warning",
          actual: {
            element: `<img src="foo.jpg" alt="">`,
            length: 0,
          },
          expected: expectedLength,
        },
      ],
    });

    const html1 = (alt1: string, alt2: string) =>
      `<html><head></head><body><img src="foo.jpg" alt="${alt1}"><img src="bar.jpg" alt="${alt2}"></body></html>`;

    expect(checkImageAlt(html1("Foo", "Bar"))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "ok",
          expected: expectedLength,
          actual: {
            element: `<img src="foo.jpg" alt="Foo">`,
            length: 3,
          },
        },
        {
          key: "length",
          status: "ok",
          expected: expectedLength,
          actual: {
            element: `<img src="bar.jpg" alt="Bar">`,
            length: 3,
          },
        },
      ],
    });

    expect(checkImageAlt(html1("Foo", ""))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "ok",
          expected: expectedLength,
          actual: {
            element: `<img src="foo.jpg" alt="Foo">`,
            length: 3,
          },
        },
        {
          key: "length",
          status: "warning",
          expected: expectedLength,
          actual: {
            element: `<img src="bar.jpg" alt="">`,
            length: 0,
          },
        },
      ],
    });

    expect(checkImageAlt(html1("", "Bar"))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "warning",
          expected: expectedLength,
          actual: {
            element: `<img src="foo.jpg" alt="">`,
            length: 0,
          },
        },
        {
          key: "length",
          status: "ok",
          expected: expectedLength,
          actual: {
            element: `<img src="bar.jpg" alt="Bar">`,
            length: 3,
          },
        },
      ],
    });

    expect(checkImageAlt(html1("", ""))).toEqual({
      rule: "imageAlt",
      info: [
        {
          key: "length",
          status: "warning",
          expected: expectedLength,
          actual: {
            element: `<img src="foo.jpg" alt="">`,
            length: 0,
          },
        },
        {
          key: "length",
          status: "warning",
          expected: expectedLength,
          actual: {
            element: `<img src="bar.jpg" alt="">`,
            length: 0,
          },
        },
      ],
    });
  });

  it("checks for word count", () => {
    const html = (body: string) =>
      `<html><head></head><body>${body}</body></html>`;

    // TODO more tests
    //
    expect(
      checkWordCount(
        html(
          "<h1>Hello World</h1><span>How are you?</span><p>Lorem ipsum dolor sit</p>"
        )
      )
    ).toEqual({
      rule: "wordCount",
      info: [
        {
          key: "length",
          status: "ok",
          actual: { length: 7 },
        },
      ],
    });
  });

  it("checks for language", () => {
    const html = (lang: string) => `<html lang="${lang}"></html>`;

    expect(checkLanguage(html("de"))).toEqual({
      rule: "language",
      info: [
        {
          key: "language",
          status: "ok",
          actual: { language: "de" },
        },
      ],
    });

    expect(checkLanguage(html("en-us"))).toEqual({
      rule: "language",
      info: [
        {
          key: "language",
          status: "ok",
          actual: { language: "en-us" },
        },
      ],
    });

    expect(checkLanguage(html(""))).toEqual({
      rule: "language",
      info: [
        {
          key: "language",
          status: "warning",
          actual: { language: "" },
        },
      ],
    });
  });

  it("checks for charset", () => {
    const html = (head: string) => `<html><head>${head}</head></html>`;

    expect(checkCharset(html('<meta charset="UTF-8">'))).toEqual({
      rule: "charset",
      info: [
        {
          key: "charset",
          status: "ok",
          actual: { charset: "UTF-8" },
        },
      ],
    });

    expect(checkCharset(html('<meta charset="ISO-8859-1">'))).toEqual({
      rule: "charset",
      info: [
        {
          key: "charset",
          status: "ok",
          actual: { charset: "ISO-8859-1" },
        },
      ],
    });

    expect(
      checkCharset(
        html(
          '<meta http-equiv="Content-Type" content="text/html charset=utf-8">'
        )
      )
    ).toEqual({
      rule: "charset",
      info: [
        {
          key: "charset",
          status: "ok",
          actual: { charset: "utf-8" },
        },
      ],
    });

    expect(checkCharset(html('<meta charset="">'))).toEqual({
      rule: "charset",
      info: [
        {
          key: "charset",
          status: "warning",
          actual: { charset: "" },
        },
      ],
    });

    expect(
      checkCharset(html('<meta charset="utf-8"><meta charset="ISO-8859-1">'))
    ).toEqual({
      rule: "charset",
      info: [
        {
          key: "multiple",
          status: "error",
          actual: { charset: "utf-8" },
        },
        {
          key: "multiple",
          status: "error",
          actual: { charset: "ISO-8859-1" },
        },
      ],
    });

    expect(
      checkCharset(
        html(
          '<meta http-equiv="Content-Type" content="text/html charset=utf-8"><meta charset="ISO-8859-1">'
        )
      )
    ).toEqual({
      rule: "charset",
      info: [
        {
          key: "multiple",
          status: "error",
          actual: { charset: "utf-8" },
        },
        {
          key: "multiple",
          status: "error",
          actual: { charset: "ISO-8859-1" },
        },
      ],
    });
  });

  it("checks for meta viewport", () => {
    const html = (head: string) =>
      `<html><head>${head}</head><body></body></html>`;

    const viewport =
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

    const expectedViewport = {
      viewport,
    };

    expect(checkMetaViewport(html(viewport))).toEqual({
      rule: "metaViewport",
      info: [
        {
          key: "viewport",
          status: "ok",
          actual: {
            element: viewport,
          },
          expected: expectedViewport,
        },
      ],
    });

    expect(
      checkMetaViewport(html('<meta name="viewport" content="foo">'))
    ).toEqual({
      rule: "metaViewport",
      info: [
        {
          key: "viewport",
          status: "warning",
          actual: {
            element: '<meta name="viewport" content="foo">',
          },
          expected: expectedViewport,
        },
      ],
    });

    expect(
      checkMetaViewport(
        html(
          '<meta name="viewport" content="bar"><meta name="viewport" content="foo">'
        )
      )
    ).toEqual({
      rule: "metaViewport",
      info: [
        {
          key: "multiple",
          status: "error",
          actual: {
            element: '<meta name="viewport" content="bar">',
          },
          expected: expectedViewport,
        },
        {
          key: "multiple",
          status: "error",
          actual: {
            element: '<meta name="viewport" content="foo">',
          },
          expected: expectedViewport,
        },
      ],
    });
  });

  it("checks for favicon", () => {
    const html = (favicon: string) =>
      `<html><head>${favicon}</head><body></body></html>`;

    expect(checkFavicon(html('<link rel="icon" href="favicon1.png">'))).toEqual(
      {
        rule: "favicon",
        info: [
          {
            key: "favicon",
            status: "ok",
            actual: {
              icons: [{ rel: "icon", href: "favicon1.png" }],
              length: 1,
            },
          },
        ],
      }
    );

    expect(
      checkFavicon(
        html(
          '<link rel="icon" href="favicon1.png"><link rel="icon" href="favicon2.png">'
        )
      )
    ).toEqual({
      rule: "favicon",
      info: [
        {
          key: "favicon",
          status: "ok",
          actual: {
            icons: [
              { rel: "icon", href: "favicon1.png" },
              { rel: "icon", href: "favicon2.png" },
            ],
            length: 2,
          },
        },
      ],
    });

    expect(checkFavicon(html(""))).toEqual({
      rule: "favicon",
      info: [
        {
          key: "missing",
          status: "warning",
          actual: {},
        },
      ],
    });

    expect(
      checkFavicon(
        html(
          '<link rel="shortcut icon" href="favicon1.png" sizes="32x32"><link rel="icon" href="favicon2.png">'
        )
      )
    ).toEqual({
      rule: "favicon",
      info: [
        {
          key: "favicon",
          status: "ok",
          actual: {
            icons: [
              { rel: "shortcut icon", href: "favicon1.png", sizes: "32x32" },
              { rel: "icon", href: "favicon2.png" },
            ],
            length: 2,
          },
        },
      ],
    });
  });
});
