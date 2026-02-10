import jobApplicationApi from "@/api/modules/jobApplication.api";
import JobApplicationTable from "@/components/JobApplicationTable";
import NoItems from "@/components/NoItems";
import JobTrackerStats from "@/components/JobTrackerStats";
import JobTrackerFilters from "@/components/JobTrackerFilters";
import { JobApplication, CreateJobApplicationData } from "@/models/JobApplication";
import { Button } from "@/components/ui/button";
import SearchingLoader from "@/components/SearchingLoader";
import {
  Box,
  Flex,
  Text,
  VStack,
} from "@chakra-ui/react";
import { statusFilterOptions, sortOptions } from "@/constants/jobApplication";
import { useEffect, useState, useCallback } from "react";
import SEO from "@/components/SEO";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useIterativeSearch } from "@/hooks/useIterativeSearch";

const JobTracker = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("-appliedOn");
  const [stats, setStats] = useState({ total: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 });



  const stableFetchFunction = useCallback((page: number, limit: number) => {
    return jobApplicationApi.getAll({
      page,
      limit,
      status: statusFilter,
      sort: sortOrder
    });
  }, [statusFilter, sortOrder]);
  const filterFunction = useCallback((app: JobApplication, query: string) => {
    const lowerQuery = query.toLowerCase();
    return !!(
      (app.company && app.company.toLowerCase().includes(lowerQuery)) ||
      (app.role && app.role.toLowerCase().includes(lowerQuery)) ||
      (app.location && app.location.toLowerCase().includes(lowerQuery)) ||
      (app.note && app.note.toLowerCase().includes(lowerQuery))
    );
  }, []);

  const {
    items: applications,
    setItems: setApplications,
    loading,
    isSearching,
    currentPage,
    setCurrentPage,
    hasMore,
    hasPrev,
    nextPage,
    prevPage,
  } = useIterativeSearch<JobApplication>({
    fetchFunction: stableFetchFunction,
    searchQuery: searchTerm,
    filterFunction,
    pageSize: 20,
    enabled: isLoggedIn,
  });

  const fetchStats = useCallback(async () => {
    if (!isLoggedIn) return;
    const res = await jobApplicationApi.getStats();
    if (res.status === "success" && res.data) {
      setStats(res.data);
    }
  }, [isLoggedIn]);

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
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreateApplication = async (values: Partial<CreateJobApplicationData>) => {
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
    values: Partial<CreateJobApplicationData>
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
    if (isLoggedIn) {
      fetchStats();
    } else {
      setStats({ total: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 });
    }
  }, [isLoggedIn, fetchStats]);

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

        {isLoggedIn && (
          <JobTrackerFilters
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearch={handleSearch}
            handleKeyPress={handleKeyPress}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setPage={(p: number) => setCurrentPage(p - 1)}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            statusOptions={statusFilterOptions}
            sortOptions={sortOptions}
            handleCreateApplication={handleCreateApplication}
          />
        )}


        {loading && applications.length === 0 && (
          <Flex justify="center" align="center" height="30vh">
            <VStack gap={4}>
              <SearchingLoader isSearching={isSearching} text="Loading matches..." />
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

        {!loading && applications.length === 0 && !isSearching && (
          <NoItems text="job applications" />
        )}

        {applications.length > 0 && <SearchingLoader isSearching={isSearching} />}


        {isLoggedIn && applications.length > 0 && !isSearching && (
          <Flex justify="center" align="center" gap={4} py={6}>
            <Button
              onClick={prevPage}
              disabled={!hasPrev}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Text fontSize="sm" fontWeight="medium">
              Page {currentPage + 1}
            </Text>
            <Button
              onClick={nextPage}
              disabled={!hasMore}
              variant="outline"
              size="sm"
              loading={loading}
            >
              Next
            </Button>
          </Flex>
        )}

      </Flex >
    </>
  );
};

export default JobTracker;
