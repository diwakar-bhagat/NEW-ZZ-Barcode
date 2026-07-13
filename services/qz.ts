import * as qz from "qz-tray";

// QZ Tray runs locally on the user's machine; the browser talks to it over a
// local websocket. Unsigned mode: QZ shows an "Allow" prompt on first connect.
// To remove the prompt later, generate a certificate/private key pair and wire
// them into setCertificatePromise/setSignaturePromise.

let securityConfigured = false;
let connecting: Promise<void> | null = null;

const configureSecurity = () => {
  if (securityConfigured) {
    return;
  }
  qz.security.setCertificatePromise((resolve: (value?: string) => void) => resolve());
  qz.security.setSignaturePromise(() => (resolve: (value?: string) => void) => resolve());
  securityConfigured = true;
};

export class QzError extends Error {
  readonly kind: "not-installed" | "connection-failed" | "printer" | "unknown";

  constructor(kind: QzError["kind"], message: string) {
    super(message);
    this.name = "QzError";
    this.kind = kind;
  }
}

const normalizeError = (error: unknown): QzError => {
  if (error instanceof QzError) {
    return error;
  }
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown QZ Tray error";
  if (/unable to establish connection|connection refused|failed to connect/i.test(message)) {
    return new QzError(
      "not-installed",
      "Could not reach QZ Tray. Make sure it is installed and running on this computer.",
    );
  }
  if (/printer/i.test(message)) {
    return new QzError("printer", message);
  }
  return new QzError("connection-failed", message);
};

export const isConnected = (): boolean => qz.websocket.isActive();

export const connect = async (): Promise<void> => {
  if (isConnected()) {
    return;
  }
  if (!connecting) {
    configureSecurity();
    connecting = qz.websocket
      .connect({ retries: 2, delay: 1 })
      .then(() => undefined)
      .catch((error: unknown) => {
        throw normalizeError(error);
      })
      .finally(() => {
        connecting = null;
      });
  }
  return connecting;
};

export const disconnect = async (): Promise<void> => {
  if (!isConnected()) {
    return;
  }
  try {
    await qz.websocket.disconnect();
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getPrinters = async (): Promise<string[]> => {
  await connect();
  try {
    const found = await qz.printers.find();
    if (Array.isArray(found)) {
      return found;
    }
    return found ? [found] : [];
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getDefaultPrinter = async (): Promise<string | null> => {
  await connect();
  try {
    const printer = await qz.printers.getDefault();
    return typeof printer === "string" && printer.length > 0 ? printer : null;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const printRaw = async (printer: string, tspl: string): Promise<void> => {
  await connect();
  try {
    const config = qz.configs.create(printer);
    await qz.print(config, [{ type: "raw", format: "command", flavor: "plain", data: tspl }]);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const printHTML = async (printer: string, html: string): Promise<void> => {
  await connect();
  try {
    const config = qz.configs.create(printer);
    await qz.print(config, [{ type: "pixel", format: "html", flavor: "plain", data: html }]);
  } catch (error) {
    throw normalizeError(error);
  }
};
