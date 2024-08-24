import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    NextResponse.json({ message: "Missing Credentials" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  if (!genAI) {
    NextResponse.json({ message: "Cannot get Gemini API" }, { status: 500 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const data = await req.json();
    const userPrompt = data.body;
    const enhancedPrompt = `
        Create a modern, responsive React component using the following requirements:
        User's request: "${userPrompt}"
        Guidelines:
        1. Use functional components and hooks where appropriate.
        2. Implement Tailwind CSS (version 3.x) for styling. Use utility classes efficiently.
        3. Ensure the design is responsive and works well on mobile, tablet, and desktop.
        4. Include appropriate accessibility attributes (aria-labels, roles, etc.).
        5. Use semantic HTML elements where possible.
        6. Add brief comments to explain any complex logic or structure.
        7. Do not include any import statements or export declarations.
        8. Utilize Tailwind's color palette, especially focusing on pastel shades for primary elements and darker shades for neutral tones.
        9. Implement hover and focus states for interactive elements.
        10. Use Tailwind's built-in animations and transitions for subtle UI enhancements.

        Only output the JSX code for the component. Ensure the code is clean, well-formatted, and follows React best practices.
        `;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const code = await response.text();

    return NextResponse.json({ code: code }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occured while generating the code!" },
      { status: 500 }
    );
  }
}
