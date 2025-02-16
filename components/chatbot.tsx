"use client";
import { lazy, Suspense, useEffect, useState } from "react";
const ChatBot = lazy(() => import("react-chatbotify"));

const Chatbot = () => {
  const [flowType, setFlowType] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const formStyle = {
    marginTop: 10,
    marginLeft: 20,
    border: "1px solid #491d8d",
    padding: 10,
    borderRadius: 5,
    maxWidth: 300,
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
      path: "end",
    },
    end: {
      message: "Start Again ?",
      // component: (
      //   <div style={formStyle}>
      //     <p>Name: {form?.name}</p>
      //   </div>
      // ),
      options: ["New Registration", "Insurance Query", "Nothing More"],
      chatDisabled: true,
      path: "ai_flow",
    },
  };
  return (
    <ChatBot
      settings={{
        general: { embedded: true },
        header: {
          title: "Insurance Bot",
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
