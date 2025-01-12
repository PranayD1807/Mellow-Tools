import ToolGrid from "@/components/ToolGrid";
import { Tool } from "@/models/Tool";
import { Flex } from "@chakra-ui/react";

const toolList: Tool[] = [
  {
    id: "text-template",
    label: "Text Templates",
    description: "Craft and Customize Text Templates Effortlessly.",
    endpoint: "/text-templates",
    icon: "/template-logo.png",
  },
  {
    id: "notes",
    label: "Notes",
    description: "Instantly Capture and Organize Your Notes.",
    endpoint: "/notes",
    icon: "/notes-logo.png",
  },
  {
    id: "job-tracker",
    label: "Job Tracker",
    description: "Streamline Your Job Hunt with Ease.",
    endpoint: "/job-tracker",
    icon: "/job-tracker-logo.png",
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
