/* Conservative OCR suggestions. Nothing is added to a bill without review. */
export function parseReceiptCandidates(rawText) {
  const lines = String(rawText || '').split(/\r?\n/);
  const candidates = [];
  for (const original of lines) {
    const line = original.replace(/\s+/g,' ').trim();
    if (line.length < 4 || /(?:subtotal|total|vat|tax|service|discount|change|cash|balance|รวมทั้งสิ้น|ยอดรวม|ภาษี|ส่วนลด|เงินทอน|итого|сдача)/i.test(line)) continue;
    const match = line.match(/^(.{2,90}?)\s+(?:(\d{1,2})\s*[x×]\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:฿|THB|บาท)?$/i);
    if (!match) continue;
    const quantity = match[2] ? Number(match[2]) : 1;
    const price = Number(match[3].replace(/,/g,''));
    if (!Number.isFinite(price) || price <= 0 || price > 1000000 || quantity < 1 || quantity > 30) continue;
    const name = match[1].replace(/^[\d.\s-]+/,'').trim();
    if (name.length < 2 || /^\d+$/.test(name)) continue;
    candidates.push({name,price:Math.round(price*100)/100,quantity,source:line});
  }
  return candidates.slice(0,50);
}
