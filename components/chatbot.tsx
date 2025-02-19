"use client";
import { lazy, Suspense, useEffect, useState } from "react";
const ChatBot = lazy(() => import("react-chatbotify"));
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  NEW_REGISTRATION_PROMPT,
  INSURANCE_QUERY_PROMPT,
  VERIFY_REGISTRATION_PROMPT,
} from "../constants/prompts";

const Chatbot = () => {
  const [flowType, setFlowType] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [conversation, setConversation] = useState<any>([]);
  let hasEnded = false;

  const key = process.env.NEXT_PUBLIC_AI_KEY || "";
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const ai_conversation_response = async (params: any) => {
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
    // await params.injectMessage("Thank you for using our service.");
    let tempConversation = [...conversation];
    tempConversation.push({ Patient: params.userInput });
    setConversation(tempConversation);
    console.log(conversation);
    let finalPrompt = `${prompt}`;
    conversation.forEach((item: any) => {
      finalPrompt += `\n${Object.keys(item)[0]}: ${Object.values(item)[0]}`;
    });
    finalPrompt += `\nPatient: ${params.userInput}. Assistant: `;
    console.log(finalPrompt);
    const result = await model.generateContent(finalPrompt);
    if (result?.response?.candidates?.length) {
      let finalResponse = result?.response?.candidates[0].content.parts[0].text;
      finalResponse = finalResponse?.replace("Patient: ", "");
      finalResponse = finalResponse?.replaceAll("*", "");
      finalResponse = finalResponse?.replaceAll('"', "");
      finalResponse = finalResponse?.replaceAll("“", "");
      finalResponse =
        (finalResponse?.split("Assistant:")?.length || 0) >= 2
          ? finalResponse?.split("Assistant:")[1]
          : finalResponse;
      finalResponse = finalResponse?.replace("Assistant:", "");
      if (finalResponse?.trim() === "Done.") {
        let verifyPrompt = VERIFY_REGISTRATION_PROMPT;
        conversation.forEach((item: any) => {
          verifyPrompt += `\n${Object.keys(item)[0]}: ${
            Object.values(item)[0]
          }`;
        });
        const verifyResponse = await model.generateContent(verifyPrompt);
        if (verifyResponse?.response?.candidates?.length) {
          console.log(
            "result",
            verifyResponse?.response?.candidates[0].content.parts[0].text
          );
          return verifyResponse?.response?.candidates[0].content.parts[0].text;
        }
      }
      tempConversation.push({ Assistant: finalResponse });
      setConversation(tempConversation);
      return finalResponse;
    }
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
      path: "loop",
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
