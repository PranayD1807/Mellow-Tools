import ToolGrid from "@/components/ToolGrid";
import { Tool } from "@/models/Tool";
import { Flex } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

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
    <>
      <Helmet>
        <title>Mellow Tools Dashboard | Explore Friendly Tools</title>
        <meta
          name="description"
          content="Discover and explore tools like text templates, notes, and job tracker to boost your productivity effortlessly."
        />
        <meta
          property="og:title"
          content="Mellow Tools Dashboard | Explore Friendly Tools"
        />
        <meta
          property="og:description"
          content="Browse our suite of tools including text templates, notes, and job tracker. Make your workflow easier with Mellow Tools."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Flex direction="column" p={4} alignItems="start" gap={6} w="100%" mt={4}>
        <ToolGrid tools={toolList} />
      </Flex>
    </>
  );
};

export default Dashboard;
