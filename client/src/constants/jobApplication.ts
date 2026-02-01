import { createListCollection } from "@chakra-ui/react";

export const statusOptions = createListCollection({
    items: [
        { label: "Applied", value: "Applied" },
        { label: "Interviewing", value: "Interviewing" },
        { label: "Offer", value: "Offer" },
        { label: "Rejected", value: "Rejected" },
    ],
});

export const statusFilterOptions = createListCollection({
    items: [
        { label: "All Statuses", value: "all" },
        { label: "Applied", value: "Applied" },
        { label: "Interviewing", value: "Interviewing" },
        { label: "Offer", value: "Offer" },
        { label: "Rejected", value: "Rejected" },
    ],
});

export const sortOptions = createListCollection({
    items: [
        { label: "Applied Date (Newest)", value: "-appliedOn" },
        { label: "Applied Date (Oldest)", value: "appliedOn" },
        { label: "Company (A-Z)", value: "company" },
        { label: "Company (Z-A)", value: "-company" },
        { label: "Last Updated", value: "-updatedAt" },
    ],
});

export const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
