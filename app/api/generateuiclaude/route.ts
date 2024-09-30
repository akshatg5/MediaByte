import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

export const runtime = "edge";

const MAX_RETRIES = 1;
const RETRY_DELAY = 500;
const TIMEOUT_MS = 20000;

const anthropicModel = new ChatAnthropic({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelName: "claude-2",
});

const promptTemplate = new PromptTemplate({
  template: `Create a modern, responsive React component using the following requirements:
    User's request: "{userPrompt}"
    Guidelines:
    1. Return basic UI code only, just the design bit, not the state and hooks.
    2. Define a single functional component named 'Component'.
    3. Use Tailwind CSS for styling. Use dark backgrounds and light shades of text consistently.
    4. Ensure the design is responsive for mobile, tablet, and desktop.
    5. Include appropriate accessibility attributes.
    6. Use semantic HTML elements where possible.
    7. Implement hover and focus states for interactive elements.
    8. Use bg-black/bg-blue/or of the format bg-[hexcode] for backgrounds.
    9. For icons, use inline SVG code from Lucide React icons.
    10. Keep the code concise, aiming for no more than 150-175 lines.
    11. Add brief comments to explain any complex logic or structure.
    12. Ensure all JSX is properly closed and nested.
    13. Don't use external libraries or import statements.

    Provide only the component code, no additional explanations.`,
  inputVariables: ["userPrompt"],
});

const chain = new LLMChain({ llm: anthropicModel, prompt: promptTemplate });

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
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Missing Anthropic API Key" },
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
    console.error("Error generating code using Claude", error);
    return NextResponse.json(
      { error: "Error occurred generating code via Claude" },
      { status: 500 }
    );
  }
}