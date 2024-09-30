import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const runtime = "edge";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Missing Replicate API token" },
      { status: 500 }
    );
  }

  try {
    const data = await req.json();
    const userPrompt = data.body;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Missing user prompt in request body" },
        { status: 400 }
      );
    }

    const input = {
      prompt: `
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
      10. Don't assume that there is already another existing library for icons or components, make sure most of the code is native.
      11. Keep the code concise, aiming for no more than 150-175 lines.
      12. Add brief comments to explain any complex logic or structure.
      13. Ensure all JSX is properly closed and nested.
      14. Don't use external libraries or import statements.Use native react code like button,div,h1,h2,p,span.
      15. Just give the code, no need for extra explanations,greetings,opening sentences etc.No need to add such sentences :Sure, here's a possible implementation of the 'Component' functional component that meets the requirements you've specified: or his code defines a single functional component named 'Component' that returns a JSX element tree representing a landing page for a shoe selling website. The design is responsive, using Tailwind CSS classes to define the layout and styling. The component includes appropriate accessibility attributes and uses semantic HTML elements where possible. Hover and focus states are implemented for interactive elements, and icons are used from the Lucide React icons library. The code is concise, with brief comments added to explain any complex logic or structure.Note that this implementation assumes that the LucideIcon component is already imported and available in your React project. If not, you'll need to add the appropriate import statement and modify the icon name accordingly.Just give the pure code only.
      Example structure:
      const Component = () => {
        return (
          <div>
            {/* Component JSX here */}
          </div>
        );
      };

      Provide only the component code, no additional explanations.
    `,
      max_length: 500,
      temperature: 0.75,
      top_p: 0.9,
    };

    const output = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      { input }
    );

    let code:any = Array.isArray(output) ? output.join("") : output;

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
  } catch (error: any) {
    console.error("Error generating code with LLAMA 2:", error);
    return NextResponse.json(
      {
        error: `An error occurred while generating the code: ${error.message}`,
      },
      { status: 500 }
    );
  }
}