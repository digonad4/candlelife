
export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  payment_status: "pending" | "confirmed" | "failed";
  payment_method: "cash" | "credit_card" | "debit_card" | "pix" | "transfer" | "invoice";
  client_id?: string | null;
  category?: string;
  recurring?: boolean;
  client?: { name: string };
}

export interface DateRange {
  start: string;
  end: string;
}
