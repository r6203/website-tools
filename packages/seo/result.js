const x1 = {
  check: "title",
  result: "ok",
};

const x2 = {
  check: "title",
  result: "warning",
  info: [
    {
      key: "length",
      actual: 160,
      expected: [
        {
          key: "from",
          value: 1,
        },
        {
          key: "to",
          value: 160,
        },
      ],
    },
  ],
};

const x3 = {
  check: "title",
  result: "error",
  info: [{ key: "missing" }],
};

const x4 = {
  check: "imageAlt",
  result: "warning",
  info: [
    {
      key: "missing",
      actual: '<img src="foo.jpg">',
    },
  ],
};

const x5 = {
  check: "imageAlt",
  result: "warning",
  info: [
    {
      key: "missing",
      actual: '<img src="foo.jpg">',
    },
    {
      key: "length",
      actual:
        '<img src="foo.jpg" alt="wjeriowjeitgjweritjiwertjierjhijhtijeijhirjhtijhigjeritjhiertierjitjeritiegerjhgirjfijierjeritjiejtierjgijdfigjdijeritjiertjierjtijgijdfibjmijmgijeritjidfgidfgjmidjhirjitgjsdfigjmdifhirjhioerjgidfmgijdijirjhijhio">',
    },
  ],
};
