import type { JenisSurat } from "@/lib/types";

export interface ExtractedSurat {
  nomor_surat: string;
  tanggal: string;
  perihal: string;
  tujuan: string;
}

export type ExtractionSource = "regex" | "ai";

interface GeminiFilePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

function getApiKey(): string {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Variabel lingkungan GOOGLE_GEMINI_API_KEY belum diisi."
    );
  }
  return key;
}

function getModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
}

async function callGemini(
  parts: { text?: string; file?: GeminiFilePart }[],
  jsonMode: boolean
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${getModel()}:generateContent?key=${getApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: parts.map((p) =>
              p.file ? { inlineData: p.file.inlineData } : { text: p.text }
            ),
          },
        ],
        generationConfig: {
          temperature: 0.1,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Gemini API error (${response.status}): ${body.slice(0, 500)}`
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");

  if (!text) {
    throw new Error("Gemini tidak mengembalikan teks apa pun.");
  }

  return text.trim();
}

export async function extractTextFromPdf(base64: string): Promise<string> {
  return callGemini(
    [
      {
        file: {
          inlineData: { mimeType: "application/pdf", data: base64 },
        },
      },
      {
        text: "Tuliskan ulang seluruh isi teks dari dokumen PDF ini secara verbatim dan lengkap, tanpa komentar atau penjelasan tambahan.",
      },
    ],
    false
  );
}

function safeParseJson(text: string): Record<string, unknown> | null {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseTanggalToISO(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return value;
  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }
  const months: Record<string, string> = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };
  const mdy = value.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
  );
  if (mdy) {
    const month = months[mdy[2].toLowerCase()];
    if (month) {
      return `${mdy[3]}-${month}-${mdy[1].padStart(2, "0")}`;
    }
  }
  const dwy = value.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/
  );
  if (dwy) {
    const month = months[dwy[1].toLowerCase()];
    if (month) {
      return `${dwy[3]}-${month}-${dwy[2].padStart(2, "0")}`;
    }
  }
  return "";
}

const MONTH_NAMES =
  "januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember";

function extractNomorSurat(text: string): string {
  const patterns = [
    /nomor\s*(?:surat)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9./\- ]{1,60})/i,
    /(?:no\.?|no)\s*[:\-]?\s*([A-Z0-9][A-Z0-9./\- ]{1,60})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1].replace(/\s+/g, " ").trim();
      if (value.length >= 3) return value;
    }
  }
  return "";
}

function extractTanggal(text: string): string {
  const dayMonthYear = text.match(
    new RegExp(`(\\d{1,2})\\s+(${MONTH_NAMES})\\s+(\\d{4})`, "i")
  );
  if (dayMonthYear) {
    const iso = parseTanggalToISO(
      `${dayMonthYear[1]} ${dayMonthYear[2]} ${dayMonthYear[3]}`
    );
    if (iso) return iso;
  }

  const numeric = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (numeric) {
    const iso = parseTanggalToISO(`${numeric[1]}/${numeric[2]}/${numeric[3]}`);
    if (iso) return iso;
  }

  const monthDayYear = text.match(
    new RegExp(`(${MONTH_NAMES})\\s+(\\d{1,2})\\s+(\\d{4})`, "i")
  );
  if (monthDayYear) {
    const iso = parseTanggalToISO(
      `${monthDayYear[1]} ${monthDayYear[2]} ${monthDayYear[3]}`
    );
    if (iso) return iso;
  }

  return "";
}

function extractPerihal(text: string): string {
  const match = text.match(
    /(?:perihal|hal)\s*[:\-]?\s*([^\n]{2,500})/i
  );
  if (match) {
    const value = match[1].trim();
    if (value.length >= 3) return value;
  }
  return "";
}

function extractTujuan(text: string, jenis: JenisSurat): string {
  const patterns =
    jenis === "Surat Masuk"
      ? [
          /pengirim\s*[:\-]?\s*([^\n]{2,200})/i,
          /(?:dari|asal)\s*[:\-]?\s*([^\n]{2,200})/i,
          /instansi\s*[:\-]?\s*([^\n]{2,200})/i,
          /kepada\s+yth\.?\s*[.,]?\s*\n?\s*([^\n]{2,200})/i,
        ]
      : [
          /kepada\s+yth\.?\s*[.,]?\s*\n?\s*([^\n]{2,200})/i,
          /tujuan\s*[:\-]?\s*([^\n]{2,200})/i,
          /instansi\s*[:\-]?\s*([^\n]{2,200})/i,
        ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1].replace(/\s+/g, " ").trim();
      if (value.length >= 2) return value;
    }
  }
  return "";
}

export function extractByRegex(
  text: string,
  jenis: JenisSurat
): ExtractedSurat {
  return {
    nomor_surat: extractNomorSurat(text),
    tanggal: extractTanggal(text),
    perihal: extractPerihal(text),
    tujuan: extractTujuan(text, jenis),
  };
}

function isComplete(data: ExtractedSurat): boolean {
  return (
    data.nomor_surat.length > 0 &&
    data.tanggal.length > 0 &&
    data.perihal.length > 0 &&
    data.tujuan.length > 0
  );
}

function extractByAi(text: string, jenis: JenisSurat): Promise<ExtractedSurat> {
  const tujuanField =
    jenis === "Surat Masuk"
      ? 'tujuan: nama instansi/pengirim surat'
      : 'tujuan: nama instansi penerima surat';

  const prompt = `Berikut adalah hasil OCR dari sebuah surat ${jenis}.

${text}

Ekstrak informasi berikut dari surat di atas dan kembalikan dalam bentuk JSON:
{
  "nomor_surat": "nomor surat, misal 421.1/123/Dikdas",
  "tanggal": "tanggal surat dalam format YYYY-MM-DD",
  "perihal": "perihal surat",
  ${tujuanField}
}

Gunakan nilai yang persis ada di teks. Jika tidak ditemukan, gunakan string kosong.`;
  return callGemini([{ text: prompt }], true).then((raw) => {
    const parsed = safeParseJson(raw);
    const data: ExtractedSurat = {
      nomor_surat: readString(parsed?.nomor_surat),
      tanggal: parseTanggalToISO(readString(parsed?.tanggal)),
      perihal: readString(parsed?.perihal),
      tujuan: readString(parsed?.tujuan),
    };
    return data;
  });
}

export async function extractSuratFromPdf(
  base64: string,
  jenis: JenisSurat
): Promise<{ data: ExtractedSurat; source: ExtractionSource }> {
  const ocrText = await extractTextFromPdf(base64);

  const regexResult = extractByRegex(ocrText, jenis);
  if (isComplete(regexResult)) {
    return { data: regexResult, source: "regex" };
  }

  const aiResult = await extractByAi(ocrText, jenis);
  return { data: aiResult, source: "ai" };
}
