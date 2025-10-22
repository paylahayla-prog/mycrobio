import en from "../knowledge/en.json" assert { type: "json" };
import fr from "../knowledge/fr.json" assert { type: "json" };

export function getStaticKnowledge(language: 'en' | 'fr'): string {
  const data: any = language === 'fr' ? (fr as any) : (en as any);
  const lines: string[] = [];
  const pushSection = (title: string, arr?: string[]) => {
    if (!arr || !arr.length) return;
    lines.push(`### ${title}`);
    for (const item of arr) lines.push(`- ${item}`);
  };
  pushSection('Identification Rules', data?.identification?.rules);
  pushSection('Identification Decision Paths', data?.identification?.decision_paths);
  pushSection('Sensitivity Rules', data?.sensitivity?.rules);
  pushSection('Urine Interpretation', data?.sensitivity?.urine_interpretation);
  const txt = lines.join('\n');
  // Safety cap to avoid overly long prompts
  return txt.slice(0, 15000);
}
