import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { parse } from '@babel/parser';
import prettier from 'prettier';

export const runtime = "edge";

const validateCode = (code: string) => {
  try {
    parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    return true;
  } catch (error) {
    console.error('Parse error:', error);
    return false;
  }
};

const formatCode = async (code: string) => {
  try {
    return await prettier.format(code, {
      parser: 'babel-ts',
      semi: true,
      singleQuote: true,
    });
  } catch (error) {
    console.error('Format error:', error);
    return code;
  }
};

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing Gemini API credentials" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
      2. Return basic ui code only, just the design bit, not the state and hooks.Don't even use import React from "react";
      3. Define a single functional component named 'Component'.
      4. Use Tailwind CSS for styling.Use dark backgrounds and light shades of text in the whole page ensure this consistency, dark backgrounds,light color text.
      5. Ensure the design is responsive for mobile, tablet, and desktop.
      6. Include appropriate accessibility attributes (aria-labels, roles, etc.).
      7. Use semantic HTML elements where possible.
      8. Implement hover and focus states for interactive elements.
      9. USE bg-black/bg-blue/or of the format bg-[hexcode],avoid using the format of bg-color-number for both bg and text ALL SECTIONS FOLLOW THIS DESIGN THEME AND LIGHTER COLOR TEXT.
      10. 10. For icons, use inline SVG code from Lucide React icons. You can find the SVG code for icons at https://lucide.dev/icons. Include the SVG code directly in the JSX.
      11. Keep the code concise, aiming for no more than 150-175 lines while ensuring completeness and rapid response.
      12. Add brief comments to explain any complex logic or structure.
      13. Ensure all JSX is properly closed and nested.
      14. Use default React imports (e.g., import React, { useState } from 'react';).
      15. Don't use external libraries, use native React code only. Dont use import statements at all.

      Example structure:
      const Component = () => {
        // Component logic and JSX here
        <div>
        {/* Example of using a Lucide React icon inline */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* SVG path for the icon */}
        </svg>
        {/* Rest of the component JSX */}
      </div>
      };

      Ensure the code is clean, well-formatted, and follows React best practices.
      Do not include any additional text or explanations outside of the component code.
    `;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    let code = await response.text();

    // Clean up the code
    code = code.trim();
    if (code.startsWith("```jsx") || code.startsWith("```javascript") || code.startsWith("```typescript") || code.startsWith("```")) {
      code = code.split("\n").slice(1).join("\n");
    }
    if (code.endsWith("```")) {
      code = code.split("\n").slice(0, -1).join("\n");
    }

    code = await formatCode(code);

    return NextResponse.json({ code }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: `An error occurred while generating the code: ${error.message}` },
      { status: 500 }
    );
  }
}