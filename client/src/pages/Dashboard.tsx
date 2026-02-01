import ToolGrid from "@/components/ToolGrid";
import { Tool } from "@/models/Tool";
import { Flex } from "@chakra-ui/react";
import SEO from "@/components/SEO";

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
  {
    id: "bookmark",
    label: "Bookmarks",
    description: "Organize Your Favorite Links Effortlessly.",
    endpoint: "/bookmarks",
    icon: "/bookmark-logo.png",
  },
];

const Dashboard = () => {
  return (
    <>
      <SEO
        title="Dashboard"
        description="Discover and explore tools like text templates, notes, and job tracker to boost your productivity effortlessly."
        keywords="dashboard, productivity dashboard, Mellow Tools, manage work"
      />
      <Flex direction="column" p={4} alignItems="start" gap={6} w="100%" mt={4}>
        <ToolGrid tools={toolList} />
      </Flex>
    </>
  );
};

export default Dashboard;
