export type CSVRow = {
  token_type?: string;
  token_address: string;
  receiver: string;
  value?: string;
  amount?: string;
  id?: string;
};

export type CodeWarning = {
  message: string;
  severity: string;
  lineNum: number;
};
