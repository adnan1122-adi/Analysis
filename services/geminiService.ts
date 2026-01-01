
import { GoogleGenAI, Type } from "@google/genai";
import { ActionPlanResponse, FullAnalysis } from '../types';
import { Language } from '../translations';

declare var process: any;

export const generateEducationalActionPlan = async (
  analysis: FullAnalysis,
  lang: Language = 'en'
): Promise<ActionPlanResponse> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageInstruction = lang === 'ar' 
    ? "IMPORTANT: Output the content in ARABIC language using high-quality educational terminology." 
    : "Output the content in ENGLISH.";

  const prompt = `
    Role: Educational Data Analyst Expert.
    Task: Analyze the following academic data summary and generate specific, actionable educational plans.
    ${languageInstruction}

    Data Summary:
    - Overall Mean Score: ${analysis.summary.mean.toFixed(1)}%
    - Standard Deviation: ${analysis.summary.stdDev.toFixed(1)}
    - Pass Rate: ${((analysis.summary.passCount / (analysis.summary.passCount + analysis.summary.failCount)) * 100).toFixed(1)}%
    - Failing Students: ${analysis.summary.failCount}
    - Strongest Component: ${analysis.strongestComponent}
    - Weakest Component: ${analysis.weakestComponent}
    
    Component Details (Correlation with Final Grade):
    ${analysis.componentStats.map(c => `- ${c.name}: Mean ${c.mean.toFixed(1)}, Correlation ${c.correlationWithTotal.toFixed(2)}`).join('\n')}

    Generate detailed Markdown content for the following 5 areas. 
    1. High Achiever Plan: Enrichment, competitions, leadership.
    2. Average Student Plan: Consolidation, practice, movement to next level.
    3. At Risk Plan: Remediation, parent intervention, foundational steps.
    4. Teacher Actions: Pedagogy changes, grouping strategies, what to reteach next week.
    5. HOD Insights: Curriculum gaps, teacher PD needs, strategic changes for the department.

    Make the advice specific to the data provided. Use bullet points and bold text in Markdown for readability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            highAchieverPlan: { type: Type.STRING },
            averageStudentPlan: { type: Type.STRING },
            atRiskPlan: { type: Type.STRING },
            teacherActions: { type: Type.STRING },
            hodInsights: { type: Type.STRING }
          },
          required: ["highAchieverPlan", "averageStudentPlan", "atRiskPlan", "teacherActions", "hodInsights"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as ActionPlanResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate action plan.");
  }
};
