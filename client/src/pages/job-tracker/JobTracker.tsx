import jobApplicationApi from "@/api/modules/jobApplication.api";
import JobApplicationTable from "@/components/JobApplicationTable";
import NoItems from "@/components/NoItems";
import JobTrackerStats from "@/components/JobTrackerStats";
import JobTrackerFilters from "@/components/JobTrackerFilters";
import Pagination from "@/components/Pagination";
import { JobApplication, CreateJobApplicationData } from "@/models/JobApplication";
import {
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { statusFilterOptions, sortOptions } from "@/constants/jobApplication";
import { useEffect, useState, useCallback } from "react";
import SEO from "@/components/SEO";
import { toast } from "react-toastify";


const JobTracker = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("-appliedOn");
  const [stats, setStats] = useState({ total: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 });
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const limit = 20;

  const fetchStats = useCallback(async () => {
    const res = await jobApplicationApi.getStats();
    if (res.status === "success" && res.data) {
      setStats(res.data);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort: sortOrder,
        page,
        limit,
      };

      const res = await jobApplicationApi.getAll(params);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success" && res.data) {
        setApplications(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalResults(res.totalResults || 0);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortOrder, page, limit]);

  const handleDelete = async (docId: string) => {
    try {
      const res = await jobApplicationApi.delete(docId);
      if (res.err) {
        toast.error(res.err.message);
      } else {
        setApplications((prevItems) =>
          prevItems.filter((item) => item.id !== docId)
        );
        fetchStats();
        toast.success("Application deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete application", error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreateApplication = async (values: CreateJobApplicationData) => {
    try {
      const res = await jobApplicationApi.create(values);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        setApplications((prevItems) => [res.data!, ...prevItems]);
        fetchStats();
        toast.success("Application added successfully!");
      }
    } catch (error) {
      console.error("Error adding application:", error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdateApplication = async (
    docId: string,
    values: CreateJobApplicationData
  ) => {
    try {
      const res = await jobApplicationApi.update(docId, values);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        toast.success("Application updated successfully!");
        setApplications((prevItems) =>
          prevItems.map((app) => (app.id === docId ? res.data || app : app))
        );
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter, sortOrder, page, fetchApplications, fetchStats]);

  return (
    <>
      <SEO
        title="Job Tracker"
        description="Track and manage your job applications efficiently. Keep track of companies, roles, interview stages, and application status in one place."
        keywords="job tracker, job applications, interview tracking, career management, job search, application status"
      />
      <Flex
        direction="column"
        p={4}
        alignItems="center"
        gap={4}
        w="100%"
        mt={2}
      >
        <JobTrackerStats stats={stats} />

        <JobTrackerFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          handleKeyPress={handleKeyPress}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setPage={setPage}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          statusOptions={statusFilterOptions}
          sortOptions={sortOptions}
          handleCreateApplication={handleCreateApplication}
        />

        {/* Applications List */}
        {loading && (
          <Flex justify="center" align="center" height="30vh">
            <VStack gap={4}>
              <Spinner size="lg" borderWidth="3px" />
              <Text textStyle="xl" fontWeight="medium">
                Loading...
              </Text>
            </VStack>
          </Flex>
        )}
        {!loading && applications.length !== 0 && (
          <Box width={{ base: "95%", sm: "90%", md: "95%", lg: "90%" }}>
            <JobApplicationTable
              applications={applications}
              handleUpdateApplication={handleUpdateApplication}
              handleDeleteApplication={handleDelete}
            />
          </Box>
        )}
        {!loading && applications.length === 0 && (
          <NoItems text="job applications" />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          setPage={setPage}
        />
      </Flex >
    </>
  );
};

export default JobTracker;
