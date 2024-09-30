import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

export const runtime = "edge";

const MAX_RETRIES = 1;
const RETRY_DELAY = 500;
const TIMEOUT_MS = 20000;

const openAIModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
});

const promptTemplate = new PromptTemplate({
  template: `Create a modern, responsive React component using the following requirements:
    User's request: "{userPrompt}"
    Guidelines:
    1. You are a UI/UX expert, specializing in javascript and tailwind css.
    2. Return basic UI code only, just the design bit, not the state and hooks.
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

    Provide only the component code, no additional explanations.`,
  inputVariables: ["userPrompt"],
});

const chain = new LLMChain({ llm: openAIModel, prompt: promptTemplate });

async function generateWithRetry(userPrompt: string, retries = 0): Promise<string> {
  try {
    const result:any = await Promise.race([
      chain.call({ userPrompt }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_MS)
      ),
    ]);
    return result.text;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return generateWithRetry(userPrompt, retries + 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI API Key" },
      { status: 500 }
    );
  }

  try {
    const data = await req.json();
    const userPrompt = data.body;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Missing user prompt in request body!" },
        { status: 400 }
      );
    }

    let code = await generateWithRetry(userPrompt);
    
    // Basic cleanup
    code = code.trim();
    if (code.startsWith("```") && code.endsWith("```")) {
      code = code.slice(3, -3);
    }
    if (
      code.startsWith("jsx") ||
      code.startsWith("javascript") ||
      code.startsWith("typescript")
    ) {
      code = code.split("\n").slice(1).join("\n");
    }

    return NextResponse.json({ code }, { status: 200 });
  } catch (error) {
    console.error("Error generating code using OpenAI", error);
    return NextResponse.json(
      { error: "Error occurred generating code via OpenAI" },
      { status: 500 }
    );
  }
}