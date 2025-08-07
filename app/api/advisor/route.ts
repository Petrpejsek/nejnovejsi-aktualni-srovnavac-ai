import type { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { query } = await req.json();

  if (!query) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  // Initialize OpenAI only at runtime
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI advisor that recommends AI tools based on user queries.",
        },
        {
          role: "user",
          content: `User is looking for AI tools: ${query}. Recommend the 5 best tools with short description.`,
        },
      ],
    });

    const answer = completion.choices[0].message?.content || "No recommendations found.";
    return Response.json({ recommendations: answer });

  } catch (error: any) {
    console.error("OpenAI API Error:", error.message);
    return Response.json({ error: "Failed to fetch AI recommendations" }, { status: 500 });
  }
} 