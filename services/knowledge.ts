import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Dynamically set worker to the bundled pdf.worker
let workerReady = false;
async function ensureWorker() {
  if (workerReady) return;
  try {
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default as string;
    // @ts-ignore
    GlobalWorkerOptions.workerSrc = workerUrl;
    workerReady = true;
  } catch (e) {
    // Fallback: let pdfjs try default; if it fails, we surface an error later
    workerReady = true;
  }
}

export type KnowledgeDomain = 'identification' | 'sensitivity';

type Chunk = { text: string; domain: KnowledgeDomain };

let loaded = false;
let chunks: Chunk[] = [];

const IDENTIFICATION_PDF = encodeURI('/Bactériologie_medicale.pdf');
const SENSITIVITY_PDF = encodeURI('/Recommandations2025.pdf');

async function extractPdfText(url: string): Promise<string> {
  await ensureWorker();
  const loadingTask = getDocument(url);
  const pdf = await loadingTask.promise;
  let full = '';
  const maxPages = Math.min(pdf.numPages, 400); // safety cap
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it: any) => ('str' in it ? (it as any).str : ''))
      .join(' ')
      .replace(/\s+/g, ' ');
    full += line + '\n';
  }
  try { pdf.cleanup(); } catch {}
  return full;
}

function makeChunks(text: string, domain: KnowledgeDomain, size = 1200, overlap = 120): Chunk[] {
  const t = text.replace(/[\u0000-\u001f]/g, ' ').trim();
  const out: Chunk[] = [];
  let i = 0;
  while (i < t.length) {
    const end = Math.min(i + size, t.length);
    out.push({ text: t.slice(i, end), domain });
    i = end - overlap;
    if (i < 0) i = 0;
    if (i === end) i++;
  }
  return out;
}

export async function ensureKnowledgeLoaded(): Promise<void> {
  if (loaded) return;
  try {
    const [idText, sensText] = await Promise.all([
      extractPdfText(IDENTIFICATION_PDF),
      extractPdfText(SENSITIVITY_PDF),
    ]);
    const idChunks = makeChunks(idText, 'identification');
    const seChunks = makeChunks(sensText, 'sensitivity');
    chunks = [...idChunks, ...seChunks];
    loaded = true;
  } catch (e) {
    console.warn('Knowledge load failed:', e);
    loaded = true; // avoid retry loop; prompt still works without extra knowledge
  }
}

function scoreChunk(query: string, chunk: string): number {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = q.split(/\s+/).filter(w => w.length > 2);
  const text = chunk.toLowerCase();
  let s = 0;
  for (const w of words) {
    const occurrences = text.split(w).length - 1;
    s += occurrences;
  }
  return s;
}

export function getRelevantSnippets(
  conversation: Array<{ role: 'user' | 'model'; parts: { text: string }[] }>,
  domainHint: KnowledgeDomain | 'auto',
  k = 5,
): { identification: string[]; sensitivity: string[] } {
  if (!chunks.length) return { identification: [], sensitivity: [] };
  const recent = conversation.slice(-6);
  const query = recent.map(m => m.parts.map(p => p.text).join('\n')).join('\n');

  const ids: Array<{ score: number; c: Chunk }> = [];
  for (const c of chunks) {
    const s = scoreChunk(query, c.text);
    if (s > 0) ids.push({ score: s, c });
  }
  ids.sort((a, b) => b.score - a.score);

  const pick = (d: KnowledgeDomain) =>
    ids.filter(x => x.c.domain === d).slice(0, k).map(x => x.c.text);

  if (domainHint === 'auto') {
    return {
      identification: pick('identification'),
      sensitivity: pick('sensitivity'),
    };
  }
  const first = pick(domainHint);
  return domainHint === 'identification'
    ? { identification: first, sensitivity: pick('sensitivity').slice(0, Math.max(0, k - first.length)) }
    : { identification: pick('identification').slice(0, Math.max(0, k - first.length)), sensitivity: first };
}
