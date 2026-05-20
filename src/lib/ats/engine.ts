import { ATS_KEYWORD_BANK } from "./keyword-bank";

export interface ScoreItem {
  score: number;
  comment: string;
}

export interface DeterministicMetrics {
  ats_parse_rate: ScoreItem;
  contact_details: ScoreItem;
  sections: ScoreItem;
  dates: ScoreItem;
  repetition: ScoreItem;
  quantifying_impact: ScoreItem;
  leadership_keywords: ScoreItem;
  drive_action_verbs: ScoreItem;
  communication_keywords: ScoreItem;
  analytical_keywords: ScoreItem;
  spelling_grammar: ScoreItem;
  resume_density: ScoreItem;
  formatting_flags: ScoreItem;
  hard_skills_match: ScoreItem & { matched: string[]; missing: string[] };
  keyword_density: ScoreItem & { missing_domain_terms: string[] };
  matched_keywords: string[];
  missing_keywords: string[];
  passive_language_detected: string[];
  repeated_verbs: string[];
  typos_found: string[];
  word_count: number;
  bullet_point_count: number;
  quantified_bullets_percent: number;
  jd_overlap_percent: number;
  total_deterministic_score: number;
}

export function runDeterministicAnalysis(resumeText: string, jdText: string): DeterministicMetrics {
  const text = resumeText.toLowerCase();
  const jd = jdText.toLowerCase();

  // 1. Basic Metrics & Density
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  // Bullets: lines starting with standard bullet chars or short lines following standard format
  const bullets = lines.filter(l => /^[-•*·>]/.test(l) || (l.length > 20 && l.length < 150 && !l.endsWith(".")));
  const bulletCount = bullets.length;

  let densityScore = 5;
  let densityComment = "Good resume length and density.";
  if (wordCount < 300) { densityScore -= 4; densityComment = "Too short (<300 words). Expand on your impact."; }
  else if (wordCount > 800) { densityScore -= 2; densityComment = "Too long (>800 words). Keep it concise."; }
  if (bulletCount < 5) { densityScore = Math.max(0, densityScore - 2); densityComment += " Use more bullet points."; }

  // 2. Parse Rate
  let parseScore = 15;
  let parseComment = "Resume is clean and easily parsable by ATS.";
  if (wordCount < 150) { parseScore -= 3; parseComment = "Very little text extracted. Check format."; }
  if (text.includes("")) { parseScore -= 3; parseComment = "Encoding issues detected (unreadable characters)."; }
  // check for tables/columns by looking for huge gaps
  if (resumeText.split("\n").some(l => l.includes("          "))) { parseScore -= 2; parseComment = "Possible multi-column or table layout detected. Standardize formatting."; }

  // 3. Contact Details
  let contactScore = 10;
  const contactIssues = [];
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/.test(text);
  const hasLinkedin = /linkedin\.com\/in\//.test(text);
  
  if (!hasEmail) { contactScore -= 4; contactIssues.push("Missing email"); }
  if (!hasPhone) { contactScore -= 3; contactIssues.push("Missing phone number"); }
  if (!hasLinkedin) { contactScore -= 2; contactIssues.push("Missing LinkedIn profile"); }
  
  const contactComment = contactScore === 10 ? "All essential contact details present." : contactIssues.join(", ") + "!";

  // 4. Sections
  let sectionScore = 15;
  const missingSections = [];
  if (!/(experience|work history|employment)/.test(text)) missingSections.push("Experience");
  if (!/education/.test(text)) missingSections.push("Education");
  if (!/skills/.test(text)) missingSections.push("Skills");
  if (!/(projects|portfolio)/.test(text)) missingSections.push("Projects");

  sectionScore -= missingSections.length * 3;
  const sectionComment = sectionScore >= 12 ? "All critical sections present." : `Missing sections: ${missingSections.join(", ")}.`;

  // 5. Dates
  let dateScore = 5;
  const currentYear = new Date().getFullYear();
  const futureDates = Array.from(text.matchAll(/20[2-9]\d/g)).map(m => parseInt(m[0], 10)).filter(y => y > currentYear + 1);
  if (futureDates.length > 0) {
    dateScore -= 3;
  }
  if (!/20\d{2}/.test(text)) {
    dateScore -= 5;
  }
  const dateComment = dateScore === 5 ? "Dates are formatted properly and realistic." : futureDates.length > 0 ? "Found dates too far in the future." : "Missing explicit years.";

  // 6. Keywords (Leadership, Action, Communication, Analytical)
  const countMatches = (arr: string[]) => arr.filter(word => new RegExp(`\\b${word}\\b`, "i").test(text)).length;

  const leadershipCount = countMatches(ATS_KEYWORD_BANK.leadership);
  const leadScore = leadershipCount >= 3 ? 8 : leadershipCount > 0 ? 5 : 0;
  
  const actionCount = countMatches(ATS_KEYWORD_BANK.actionVerbs);
  const actionScore = actionCount >= 4 ? 7 : actionCount > 0 ? 4 : 0;

  const commCount = countMatches(ATS_KEYWORD_BANK.communication);
  const commScore = commCount >= 2 ? 5 : commCount > 0 ? 3 : 0;

  const analCount = countMatches(ATS_KEYWORD_BANK.analytical);
  const analScore = analCount >= 2 ? 5 : analCount > 0 ? 3 : 0;

  // 7. Impact / Quantifying
  const sentencesWithImpact = lines.filter(l => /%|\$|\b\d+[kmkM]?\b|\b(increased|reduced|optimized|saved|generated|scaled)\b/i.test(l));
  const quantifiedBulletsCount = sentencesWithImpact.length;
  let impactScore = 12;
  if (quantifiedBulletsCount < 3) impactScore -= 6;
  else if (quantifiedBulletsCount < 5) impactScore -= 3;
  
  const quantified_bullets_percent = bulletCount > 0 ? Math.round((quantifiedBulletsCount / bulletCount) * 100) : 0;
  if (quantified_bullets_percent < 30) impactScore = Math.max(0, impactScore - 3);

  // 8. Repetition & Passive Phrasing
  const repeatedVerbs: string[] = [];
  const passiveDetected: string[] = [];
  let repScore = 8;
  const verbFreq: Record<string, number> = {};
  
  const allVerbsToCheck = [...ATS_KEYWORD_BANK.actionVerbs, ...ATS_KEYWORD_BANK.leadership];
  for (const verb of allVerbsToCheck) {
    const matches = text.match(new RegExp(`\\b${verb}\\b`, "gi"));
    if (matches && matches.length >= 4) {
      repeatedVerbs.push(verb);
      repScore -= 2;
    }
  }
  repScore = Math.max(0, repScore);

  const passiveRegexes = [/\bwas\b/i, /\bwere\b/i, /\bhelped\b/i, /\bassisted\b/i, /\bresponsible for\b/i];
  passiveRegexes.forEach(r => {
    if (r.test(text)) passiveDetected.push(r.toString().replace(/[/\\b]/g, "").replace("i", ""));
  });

  // 9. Spelling & Grammar (Basic)
  let grammarScore = 8;
  const typos = [];
  if (/\b(i|me|my)\b/i.test(text)) { grammarScore -= 2; typos.push("Pronouns found (I/me/my)"); }
  if (text.includes("  ") && !text.includes("          ")) { grammarScore -= 1; } // slight penalty for double spaces, ignored if heavy columns
  const grammarComment = typos.length > 0 ? typos.join(", ") : "No major grammatical red flags detected.";

  // 10. Hard Skills Extraction (JD vs Resume)
  const allTechSkills = [
    ...ATS_KEYWORD_BANK.hardSkills.frontend,
    ...ATS_KEYWORD_BANK.hardSkills.backend,
    ...ATS_KEYWORD_BANK.hardSkills.databases,
    ...ATS_KEYWORD_BANK.hardSkills.cloud_devops,
    ...ATS_KEYWORD_BANK.hardSkills.ai_ml
  ];

  // Which skills are explicitly mentioned in JD?
  const jdSkills = allTechSkills.filter(skill => new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i").test(jd));
  
  // Of those JD skills, which are in the resume?
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  if (jdSkills.length > 0) {
    jdSkills.forEach(skill => {
      if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i").test(text)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });
  } else {
    // If JD is empty or too vague, just find some skills the user has
    allTechSkills.forEach(skill => {
      if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i").test(text)) {
        matchedSkills.push(skill);
      }
    });
  }

  const jd_overlap_percent = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : (matchedSkills.length > 5 ? 100 : 50);
  
  let hardSkillsScore = 12;
  if (jdSkills.length > 0) {
    if (jd_overlap_percent < 30) hardSkillsScore = 4;
    else if (jd_overlap_percent < 60) hardSkillsScore = 8;
    else if (jd_overlap_percent < 80) hardSkillsScore = 10;
  } else if (matchedSkills.length < 3) {
    hardSkillsScore = 6;
  }

  // Formatting flags
  const formatScore = parseScore > 10 ? 4 : 2;

  // Keyword Density
  const keyDensityScore = matchedSkills.length > 5 ? 4 : 2;

  // Calculate Subtotals
  const totalDetScore = 
    parseScore + contactScore + sectionScore + dateScore + repScore + impactScore + 
    leadScore + actionScore + commScore + analScore + grammarScore + densityScore + 
    formatScore + hardSkillsScore + keyDensityScore; // 15+10+15+5+8+12+8+7+5+5+8+5+4+12+4 = 123 (approx)
    
  return {
    word_count: wordCount,
    bullet_point_count: bulletCount,
    quantified_bullets_percent,
    jd_overlap_percent,
    total_deterministic_score: totalDetScore,
    ats_parse_rate: { score: parseScore, comment: parseComment },
    contact_details: { score: contactScore, comment: contactComment },
    sections: { score: sectionScore, comment: sectionComment },
    dates: { score: dateScore, comment: dateComment },
    repetition: { score: repScore, comment: repScore < 8 ? "Found repeated action verbs or sentence starters." : "Good sentence variety." },
    quantifying_impact: { score: impactScore, comment: impactScore > 8 ? "Strong use of numbers and impact metrics." : "Quantify more bullet points with % or numbers." },
    leadership_keywords: { score: leadScore, comment: leadScore > 5 ? "Strong leadership vocabulary." : "Use more words like 'led', 'managed'." },
    drive_action_verbs: { score: actionScore, comment: actionScore > 5 ? "Great use of strong action verbs." : "Replace weak verbs with action-oriented ones." },
    communication_keywords: { score: commScore, comment: commScore > 3 ? "Good communication signals." : "Add words highlighting collaboration." },
    analytical_keywords: { score: analScore, comment: analScore > 3 ? "Shows analytical thinking." : "Highlight data-driven decisions." },
    spelling_grammar: { score: grammarScore, comment: grammarComment },
    resume_density: { score: densityScore, comment: densityComment },
    formatting_flags: { score: formatScore, comment: formatScore === 4 ? "Standard formatting." : "Potential non-standard layout detected." },
    hard_skills_match: { 
      score: hardSkillsScore, 
      comment: hardSkillsScore > 8 ? "Excellent alignment with JD technical requirements." : "Missing several key technical skills from the JD.",
      matched: matchedSkills,
      missing: missingSkills
    },
    keyword_density: { score: keyDensityScore, comment: "Analyzed technical terminology density.", missing_domain_terms: [] },
    matched_keywords: matchedSkills,
    missing_keywords: missingSkills,
    passive_language_detected: passiveDetected,
    repeated_verbs: repeatedVerbs,
    typos_found: typos,
  };
}
