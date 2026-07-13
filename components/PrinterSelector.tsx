"use client";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSavedPrinter, savePrinter, useQZ } from "@/hooks/useQZ";

export default function PrinterSelector() {
  const t = useTranslations("App");
  const { connected, connecting, connect, printers, refreshPrinters, error } = useQZ();
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setSelected(getSavedPrinter() ?? "");
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t("qzPrinter")}</Label>
        <span
          className={`text-[10px] font-medium ${connected ? "text-emerald-600" : "text-slate-400"}`}
        >
          {connected ? t("qzConnected") : t("qzDisconnected")}
        </span>
      </div>
      {connected ? (
        <div className="flex items-center gap-2">
          <Select
            value={selected}
            onValueChange={(value) => {
              setSelected(value);
              savePrinter(value);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("qzPrinterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {printers.map((printer) => (
                <SelectItem key={printer} value={printer}>
                  {printer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("qzRefresh")}
            onClick={() => refreshPrinters()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={connecting}
          onClick={() => connect()}
        >
          {connecting ? t("qzConnecting") : t("qzConnect")}
        </Button>
      )}
      {error ? <p className="text-[10px] text-rose-600">{error}</p> : null}
    </div>
  );
}
