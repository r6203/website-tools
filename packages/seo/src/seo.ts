import * as seoRules from "./rules";
import { Rule, Rules, Result } from "./rules";
import axios from "axios";

const fetch = async <T = any>(url: string) => {
  const startTime = performance.now();

  const res = await axios.get<T>(url, {
    timeout: 15 * 1000,
  });

  const endTime = performance.now();

  return {
    ...res,
    duration: endTime - startTime,
    size: Buffer.byteLength(JSON.stringify(res.data)), // TODO check calculation
  };
};

export interface AllChecks {
  headers: Record<string, string>;
  results: Record<seoRules.Rules, seoRules.Result>;
  status: number;
  duration: number;
  size: number;
}

export const checkAll = async (url: string): Promise<AllChecks> => {
  const { data, duration, headers, status, size } = await fetch(url);

  const rules: Rule[] = [
    seoRules.checkH1,
    seoRules.checkTitle,
    seoRules.checkCharset,
    seoRules.checkImageAlt,
    seoRules.checkLanguage,
    seoRules.checkWordCount,
    seoRules.checkMetaViewport,
    seoRules.checkMetaDescription,
    seoRules.checkFavicon,
  ];

  const namedResults = rules
    .map((rule) => rule(data))
    .reduce(
      (prev, curr) => ({ ...prev, [curr.rule as Rules]: curr }),
      {} as Record<Rules, Result>
    );

  return { duration, headers, status, size, results: namedResults };
};

export const check = async (url: string, rule: Rule) => {
  const { headers, status, data, duration } = await fetch(url);

  const result = rule(data);

  return { headers, status, duration, result };
};
