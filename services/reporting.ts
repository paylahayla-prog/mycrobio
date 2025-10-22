export function getReportingGuidance(language: 'en' | 'fr', level: 'normal' | 'more' = 'more'): string {
  const more = level === 'more';
  if (language === 'fr') {
    const lines: string[] = [
      'EXIGENCES DE COMPTE‑RENDU DÉTAILLÉ',
      '- Profondeur : paragraphes clairs, valeurs/seuils concrets issus de la base de connaissance ; éviter les généralités.',
      "- Preuves : dans 'pathwaySummary', citer les tests décisifs et leur signification (ex. Oxydase négative → Entérobactéries ; MR+, VP- → en faveur d’E. coli).",
      "- Interprétation clinique : dans 'clinicalInterpretation', préciser type de prélèvement, numération, argument contamination vs infection, facteurs patient (sexe/sondage pour ECBU), puis conclure en 1–2 lignes pratiques.",
      "- Corrélation antibiogramme : dans 'correlation', indiquer la résistance naturelle attendue et si chaque résultat concorde/contredit ; en cas d’anomalie, proposer quel test d’identification re‑vérifier.",
      "- Recommandations : dans 'recommendation', lister les prochaines actions (tests de confirmation, antibiotiques à tester ensuite, prudence d’antibiothérapie).",
      "- Réponses rapides : toujours proposer des options actionnables (tests suivants typiques, aspect des colonies, ou 'Fournir l’antibiogramme').",
    ];
    if (more) {
      lines.push(
        "- Structuration : privilégier des sous‑titres ('Preuves', 'Interprétation clinique', 'Corrélation', 'Recommandations').",
        "- Chiffrage : inclure les diamètres/CMI et seuils pour l’espèce si disponibles (référence synthétique)."
      );
    }
    return lines.join('\n');
  }
  const lines: string[] = [
    'DETAILED REPORTING REQUIREMENTS',
    '- Depth: clear, concise paragraphs with concrete values/thresholds from the knowledge base; avoid generic statements.',
    "- Evidence: in 'pathwaySummary', cite decisive tests and what each means (e.g., Oxidase negative → Enterobacteriaceae; MR+, VP- → favors E. coli).",
    "- Clinical interpretation: in 'clinicalInterpretation', include specimen type, colony count thresholds, contamination vs true infection reasoning, and patient modifiers (gender/catheter for urine). Conclude with 1–2 practical lines.",
    "- Antibiogram correlation: in 'correlation', state expected natural resistance and whether each result aligns/contradicts it; if contradiction, suggest which identification step to re‑check.",
    "- Recommendations: in 'recommendation', provide next actions (confirmatory tests, targeted antibiotics to test next, stewardship cautions).",
    "- Quick replies: always include actionable options (typical next test names, likely colony appearances, or 'Provide antibiogram').",
  ];
  if (more) {
    lines.push(
      "- Structure: prefer sub‑headings ('Evidence', 'Clinical Interpretation', 'Correlation', 'Recommendations').",
      "- Numbers: include diameters/MICs and species‑specific thresholds where helpful (briefly)."
    );
  }
  return lines.join('\n');
}
