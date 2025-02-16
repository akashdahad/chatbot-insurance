"use client";
import { VStack } from "@chakra-ui/react";
import { lazy, Suspense, useEffect, useState } from "react";
const ChatBot = lazy(() => import("../components/chatbot"));
export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {isLoaded && (
        <Suspense fallback={<div>Loading...</div>}>
          <VStack
            bgColor={"white"}
            height={"100vh"}
            width={"100vw"}
            justifyContent={"center"}
          >
            <ChatBot />
          </VStack>
        </Suspense>
      )}
    </>
  );
}
