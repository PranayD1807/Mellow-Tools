import ToolGrid from "@/components/ToolGrid";
import { Tool } from "@/models/Tool";
import { Flex } from "@chakra-ui/react";

const toolList: [Tool] = [
  {
    id: "text-template",
    label: "Text Template",
    description: "Create & Use Text Templates",
    endpoint: "/text-templates",
    icon: "/template-logo.png",
  },
];

const Dashboard = () => {
  return (
    <Flex direction="column" p={4} alignItems="start" gap={6} w="100%" mt={4}>
      <ToolGrid tools={toolList} />
    </Flex>
  );
};

export default Dashboard;
