import { GoogleGenAI, Type } from "@google/genai";

import { TemplateData } from "../components/Step1Template";

export interface GenerationResult {
  htmlContent: string;
  matchScore: number;
  explanation: string;
}

export async function generateOptimizedCV(
  templateData: TemplateData,
  currentCvText: string,
  currentCvPdfBase64: string | null,
  jobDescription: string,
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Gemini API key is missing. 1. Add GEMINI_API_KEY to Vercel Environment Variables. 2. REDEPLOY your project on Vercel to bake the key into the build.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert ATS-optimization specialist and web developer.
Your task is to generate a NEW CV optimized for a specific job, using the EXACT HTML/CSS format from a provided template.

CRITICAL REQUIREMENTS FOR PDF FIDELITY:
1. DO NOT change any CSS classes, inline styles, or HTML tags from the template.
2. Keep all structural elements (divs, tables, headers, footers) exactly as they are.
3. Only replace the text content within the existing HTML tags.
4. If the template uses specific fonts (e.g., Google Fonts), ensure the <link> or @import statements are preserved.
5. Ensure all colors (text, background, borders) remain identical to the template.
6. Maintain all spacing (margins, padding, line heights) exactly as in the template.
7. Ensure email addresses and LinkedIn URLs are wrapped in valid <a> tags with href attributes (e.g., <a href="mailto:...">, <a href="https://...">).
8. The final output must be a complete, valid HTML document starting with <!DOCTYPE html> and including <html>, <head>, and <body> tags.
9. CRITICAL FOR MOBILE: Include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the <head>. Ensure the CSS is fully responsive (e.g., use max-width: 800px, width: 100%, fluid typography, and media queries). On mobile screens (max-width: 768px), increase font sizes (base 15px-16px), stack columns vertically, and ensure no horizontal scrolling is required.

INPUTS:
1. Template CV: The exact structure and styling you MUST use. If it's a PDF or image, extract its layout and styling to recreate it in HTML/CSS. If it's HTML, use it directly.
2. Current CV: The user's work history, education, skills, projects, and achievements.
3. Job Description: The target role requirements, skills, and responsibilities.

INSTRUCTIONS:
1. Analyze the Job Description to identify required skills, keywords, and experience level.
2. Compare the Current CV against the Job Description.
3. Generate new CV content that:
   - Uses the EXACT same HTML/CSS structure as the Template CV. If the template was not HTML, create a high-quality HTML/CSS representation of it.
   - Preserves all styling, colors, fonts, layouts, classes, IDs, and responsive rules.
   - Reorders sections based on job relevance (Section Prioritization). Put the most relevant experience and skills at the top.
   - Rewrites bullet points using job description keywords to beat ATS (Keyword Matching). Ensure exact keyword matches where applicable.
   - Uses formatting that passes ATS scanners (e.g., standard headings, clear bullet points) while maintaining the template's visual appeal.
   - Emphasizes matching skills and experience.
   - Maintains truthfulness and accuracy (do not invent experience, but frame existing experience to match the job description).
   - CRITICAL: Ensure all email addresses, LinkedIn profiles, portfolio URLs, and other links are wrapped in proper HTML \`<a>\` tags with valid \`href\` attributes (e.g., \`href="mailto:..."\` or \`href="https://..."\`) so they are clickable. Include \`target="_blank"\` and \`rel="noopener noreferrer"\` on web links. Preserve the template's text styling for these links.
4. Calculate a match score (0-100) indicating how well the optimized CV matches the Job Description. You MUST ensure the final optimized CV achieves an ATS match score of 90% or higher by thoroughly integrating keywords and prioritizing relevant sections.
5. Provide a brief explanation of the changes made and why.

IMPORTANT: The \`htmlContent\` field in your response MUST be a complete, valid HTML string containing the fully rendered CV, ready to be saved as an .html file. Do not use markdown formatting like \`\`\`html in the string itself.
`;

  const parts: any[] = [{ text: prompt }];

  if (templateData.base64) {
    parts.push({ text: `\n\n--- TEMPLATE CV (DOCUMENT) ---` });
    parts.push({
      inlineData: {
        mimeType: templateData.mimeType,
        data: templateData.base64,
      },
    });
  } else {
    parts.push({
      text: `\n\n--- TEMPLATE CV (TEXT/HTML) ---\n${templateData.text}`,
    });
  }

  if (currentCvPdfBase64) {
    parts.push({ text: `\n\n--- CURRENT CV (PDF) ---` });
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: currentCvPdfBase64,
      },
    });
  } else {
    parts.push({ text: `\n\n--- CURRENT CV (TEXT) ---\n${currentCvText}` });
  }

  parts.push({ text: `\n\n--- JOB DESCRIPTION ---\n${jobDescription}` });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          htmlContent: {
            type: Type.STRING,
            description:
              "The complete, valid HTML string of the generated CV. Must include all original CSS and structure.",
          },
          matchScore: {
            type: Type.NUMBER,
            description:
              "A score from 0 to 100 indicating how well the original CV matched the job description.",
          },
          explanation: {
            type: Type.STRING,
            description:
              "A brief explanation of the optimizations made to the CV.",
          },
        },
        required: ["htmlContent", "matchScore", "explanation"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini API");
  }

  try {
    const result = JSON.parse(text) as GenerationResult;
    return result;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to parse the generated CV data.");
  }
}
