"use client";
import { lazy, Suspense, useEffect, useState } from "react";
const ChatBot = lazy(() => import("react-chatbotify"));
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  NEW_REGISTRATION_PROMPT,
  INSURANCE_QUERY_PROMPT,
} from "../constants/prompts";

const Chatbot = () => {
  const [flowType, setFlowType] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  let hasEnded = false;
  const formStyle = {
    marginTop: 10,
    marginLeft: 20,
    border: "1px solid #491d8d",
    padding: 10,
    borderRadius: 5,
    maxWidth: 300,
  };

  const key = process.env.NEXT_PUBLIC_AI_KEY || "";
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const ai_conversation_response = async (params: any) => {
    // await params.injectMessage("Thank you for using our service.");
    let prompt = "";
    if (flowType === "New Registration") {
      prompt = NEW_REGISTRATION_PROMPT;
    } else {
      prompt = INSURANCE_QUERY_PROMPT;
    }
    if (params.userInput === "NA") {
      hasEnded = true;
      return "Goodbye";
    }
    const result = await model.generateContent(prompt);
    if (result?.response?.candidates?.length)
      return result?.response?.candidates[0].content.parts[0].text;
    hasEnded = true;
    return "Sorry, Something when wrong, Please try again";
  };

  const flow = {
    start: {
      message: "How can I help you today?",
      options: ["New Registration", "Insurance Query"],
      chatDisabled: true,
      function: (params: { userInput: any }) => {
        setFlowType(params.userInput);
        console.log("flowType", params.userInput);
      },
      path: "ai_flow",
    },
    ai_flow: {
      message:
        flowType === "New Registration"
          ? "What is your name?"
          : "What is your query?",
      path: "loop",
    },
    loop: {
      message: async (params: any) => {
        const response = await ai_conversation_response(params);
        console.log("response", response);
        return response;
      },
      path: () => {
        if (hasEnded) {
          return "start";
        }
        return "loop";
      },
    },
    end: {
      message: "Start Again ?",
      options: ["New Registration", "Insurance Query", "Nothing More"],
      chatDisabled: true,
      path: "ai_flow",
    },
  };
  return (
    <ChatBot
      settings={{
        general: { embedded: true, showFooter: false },
        header: {
          title: (
            <div
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Insurance Bot
            </div>
          ),
          buttons: [],
        },
        footer: {
          text: "",
        },
        // chatHistory: { storageKey: "example_basic_form" },
      }}
      flow={flow}
    />
  );
};

export default Chatbot;
