import { db } from "@/lib/offline-db";

/**
 * Store a PDF blob as base64 data URL in the sale record.
 */
export async function storePDF(saleId: string, blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await db.sales.update(saleId, {
        pdfDataUrl: dataUrl,
        pdfGeneratedAt: Date.now(),
      });
      resolve(dataUrl);
    };
    reader.onerror = () => reject(new Error("Failed to read PDF blob"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Download a stored PDF from the sale record. Returns false if no PDF stored.
 */
export async function downloadStoredPDF(saleId: string): Promise<boolean> {
  const sale = await db.sales.get(saleId);
  if (!sale?.pdfDataUrl) return false;

  const link = document.createElement("a");
  link.href = sale.pdfDataUrl;
  link.download = `${saleId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

/**
 * Check if a stored PDF exists for a sale.
 */
export async function hasStoredPDF(saleId: string): Promise<boolean> {
  const sale = await db.sales.get(saleId);
  return !!sale?.pdfDataUrl;
}
