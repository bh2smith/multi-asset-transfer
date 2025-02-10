import type {
  TokenInfoProvider,
  CollectibleTokenInfoProvider,
  EnsResolver,
} from "../provider";
import {
  DefaultTokenInfoProvider,
  DefaultCollectibleTokenInfoProvider,
  DefaultEnsResolver,
} from "../provider";
import type { CSVRow, CodeWarning } from "./common";
import type { Transfer, UnknownTransfer } from "./transfer";
import { parse, type ParseError } from "papaparse";
import { validateHeaders, validateRow } from "./validate";
import { transform } from "./transform";

const countLines = (text: string) => text.split(/\r\n|\r|\n/).length;

const generateWarnings = (
  // We need the row parameter because of the api of fast-csv
  _row: Transfer | UnknownTransfer,
  rowNumber: number,
  warnings: string[],
) => {
  const messages: CodeWarning[] = warnings.map((warning: string) => ({
    message: warning,
    severity: "warning",
    lineNum: rowNumber,
  }));
  return messages;
};

export function defaultParser(
  chainId: number,
): (csvText: string) => Promise<[Transfer[], CodeWarning[]]> {
  const tokenInfoProvider = new DefaultTokenInfoProvider(chainId);
  const collectibleTokenInfoProvider = new DefaultCollectibleTokenInfoProvider(
    chainId,
  );
  const ensResolver = new DefaultEnsResolver(chainId);
  return (csvText: string) =>
    parseCsv(
      csvText,
      tokenInfoProvider,
      collectibleTokenInfoProvider,
      ensResolver,
    );
}

export async function parseCsv(
  csvText: string,
  tokenInfoProvider: TokenInfoProvider,
  collectibleTokenInfoProvider: CollectibleTokenInfoProvider,
  ensResolver: EnsResolver,
  lineLimit: number = 500,
): Promise<[Transfer[], CodeWarning[]]> {
  // Check for line limit
  if (countLines(csvText) > lineLimit + 1) {
    throw new Error(
      `Max number of lines exceeded. Due to the block gas limit transactions are limited to ${lineLimit} lines.`,
    );
  }

  // Parse CSV
  const parseResults = parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  // Validate headers
  const headerWarnings = validateHeaders(parseResults.meta.fields);
  if (headerWarnings.length > 0) {
    return [[], headerWarnings];
  }

  // Process rows
  const csvRows = parseResults.data as CSVRow[];
  const numberedRows = csvRows
    .map((row, idx) => ({ content: row, lineNum: idx + 1 }))
    .filter(
      (row) =>
        row.content.receiver !== undefined && row.content.receiver !== "",
    );
  const transformedRows = await Promise.all(
    numberedRows.map((row) =>
      transform(
        row.content,
        tokenInfoProvider,
        collectibleTokenInfoProvider,
        ensResolver,
      ).then((transfer) => ({
        ...transfer,
        lineNum: row.lineNum,
      })),
    ),
  );
  // Collect warnings
  const resultingWarnings = transformedRows.map((row) => {
    const validationWarnings = validateRow(row);
    return generateWarnings(row, row.lineNum, validationWarnings);
  });
  // Add syntax errors from Papa Parse
  resultingWarnings.push(
    parseResults.errors.map((error: ParseError) => ({
      lineNum: error.row ?? 0 + 1,
      message: error.message,
      severity: "error",
    })),
  );

  const validRows = transformedRows.filter(
    (_, idx) => resultingWarnings[idx]?.length === 0,
  ) as Transfer[];
  return [validRows, resultingWarnings.flat()];
}
