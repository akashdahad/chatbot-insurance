import { VStack, Text } from "@chakra-ui/react";
import * as React from "react";

type HomeProps = object;

const Home: React.FunctionComponent<HomeProps> = () => {
  return (
    <VStack>
      <Text> Chatbot Home </Text>
    </VStack>
  );
};

export default Home;
