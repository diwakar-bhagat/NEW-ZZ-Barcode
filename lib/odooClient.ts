type JsonRpcResponse<T> = {
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: { message?: string };
  };
};

export type OdooSession = {
  odooUrl: string;
  db: string;
  uid: number;
  apiKey: string;
};

export type SearchProduct = {
  id: number;
  name?: string;
  display_name?: string;
  barcode?: string;
  default_code?: string;
  list_price?: number;
};

const jsonRpcCall = async <T>(odooUrl: string, params: Record<string, unknown>) => {
  const response = await fetch(`${odooUrl.replace(/\/$/, "")}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params,
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Odoo request failed: ${response.status}`);
  }

  const payload = (await response.json()) as JsonRpcResponse<T>;
  if (payload.error) {
    const message = payload.error.data?.message ?? payload.error.message;
    throw new Error(message);
  }
  return payload.result as T;
};

export const login = async (odooUrl: string, db: string, username: string, password: string) => {
  const uid = await jsonRpcCall<number>(odooUrl, {
    service: "common",
    method: "authenticate",
    args: [db, username, password, {}],
  });
  return uid;
};

export const searchProducts = async (
  session: OdooSession,
  query: string,
  limit = 20,
): Promise<SearchProduct[]> => {
  return jsonRpcCall<SearchProduct[]>(session.odooUrl, {
    service: "object",
    method: "execute_kw",
    args: [
      session.db,
      session.uid,
      session.apiKey,
      "product.template",
      "search_read",
      [
        [
          "|",
          "|",
          ["name", "ilike", query],
          ["barcode", "ilike", query],
          ["default_code", "ilike", query],
        ],
      ],
      {
        fields: ["id", "name", "barcode", "default_code", "list_price"],
        limit,
      },
    ],
  });
};
