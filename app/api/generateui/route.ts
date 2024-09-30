import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const MAX_RETRIES = 1; // Reduced to minimize total execution time
const RETRY_DELAY = 500; // Reduced to 0.5 seconds
const TIMEOUT_MS = 20000; // Global timeout of 20 seconds to fit within 25 seconds total execution time

async function generateWithRetry(model: any, prompt: string, retries = 0): Promise<string> {
  try {
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_MS))
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return generateWithRetry(model, prompt, retries + 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing Gemini API credentials" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-advanced" });
    const data = await req.json();
    const userPrompt = data.body;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Missing user prompt in request body" },
        { status: 400 }
      );
    }

    const enhancedPrompt = `
       Create a modern, responsive React component using the following requirements:
      User's request: "${userPrompt}"
      Guidelines:
      1. You are a UI/UX expert, specialising in javascript and tailwind css.
      2. Return basic ui code only, just the design bit, not the state and hooks.
      3. Define a single functional component named 'Component'.
      4. Use Tailwind CSS for styling. Use dark backgrounds and light shades of text consistently.
      5. Ensure the design is responsive for mobile, tablet, and desktop.
      6. Include appropriate accessibility attributes.
      7. Use semantic HTML elements where possible.
      8. Implement hover and focus states for interactive elements.
      9. Use bg-black/bg-blue/or of the format bg-[hexcode] for backgrounds.
      10. For icons, use inline SVG code from Lucide React icons.
      11. Keep the code concise, aiming for no more than 150-175 lines.
      12. Add brief comments to explain any complex logic or structure.
      13. Ensure all JSX is properly closed and nested.
      14. Don't use external libraries or import statements.

      Example structure:
      const Component = () => {
        return (
          <div>
            {/* Component JSX here */}
          </div>
        );
      };

      Provide only the component code, no additional explanations.
    `;

    let code = await generateWithRetry(model, enhancedPrompt);

    // Basic cleanup
    code = code.trim();
    if (code.startsWith("```") && code.endsWith("```")) {
      code = code.slice(3, -3);
    }
    if (code.startsWith("jsx") || code.startsWith("javascript") || code.startsWith("typescript")) {
      code = code.split("\n").slice(1).join("\n");
    }

    return NextResponse.json({ code }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: `An error occurred while generating the code: ${error.message}` },
      { status: 500 }
    );
  }
}
