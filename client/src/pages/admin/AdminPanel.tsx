import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Flex,
    Heading,
    Text,
    SimpleGrid,
    Spinner,
    Box,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import {
    FaUser, FaFileAlt, FaStickyNote, FaBookmark, FaBriefcase,
    FaLock, FaUserPlus, FaShieldAlt, FaCheckCircle, FaSpinner,
    FaTimesCircle, FaRegClock
} from "react-icons/fa";
import {
    XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    CartesianGrid, AreaChart, Area, Legend
} from "recharts";

import SEO from "@/components/SEO";
import adminApi, { AdminStatsResponse } from "@/api/modules/admin.api";
import AdminStatsCard from "@/components/AdminStatsCard";

const AdminPanel = () => {
    const [stats, setStats] = useState<AdminStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            const { response, err } = await adminApi.getStats();
            if (err) {
                toast.error("Admin Access Denied.");
                navigate("/dashboard");
            } else if (response && response.data) {
                setStats(response.data);
            } else {
                toast.error("Invalid analytics data received.");
                navigate("/dashboard");
            }
            setLoading(false);
        };
        fetchStats();
    }, [navigate]);

    if (loading || !stats) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="bg.canvas">
                <Spinner size="xl" color="blue.500" />
            </Flex>
        );
    }

    return (
        <Flex direction="column" p={{ base: 4, md: 8 }} gap={8} w="100%" bg="bg.canvas" minH="100vh">
            <SEO
                title="Admin Panel"
                description="Secure admin panel for Mellow Tools"
                keywords="admin, dashboard"
            />

            <Flex justify="space-between" align="center" mb={4}>
                <Box>
                    <Heading size="3xl" fontWeight="black" letterSpacing="tight" color="fg.default">
                        Admin Dashboard
                    </Heading>
                    <Text color="fg.muted" fontSize="md" mt={2}>
                        Welcome back. Here is your lifetime platform growth and metric analysis.
                    </Text>
                </Box>
            </Flex>

            <Flex direction="column" gap={16}>

                {/* User Demographics Section */}
                <Box>
                    <Heading size="sm" mb={6} textTransform="uppercase" letterSpacing="widest" color="fg.muted" fontWeight="bold">
                        Security & Demographics
                    </Heading>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
                        <AdminStatsCard label="Total Users" value={stats.usersCount} icon={<FaUser />} color="blue.500" />
                        <AdminStatsCard label="New Users (7d)" value={stats.recentUsers} icon={<FaUserPlus />} color="green.500" />
                        <AdminStatsCard label="E2E Encrypted" value={stats.usersEncrypted} icon={<FaLock />} color="purple.500" />
                        <AdminStatsCard label="2FA Enabled" value={stats.usersWith2FA} icon={<FaShieldAlt />} color="orange.500" />
                    </SimpleGrid>
                </Box>

                {/* Platform Content Section */}
                <Box>
                    <Heading size="sm" mb={6} textTransform="uppercase" letterSpacing="widest" color="fg.muted" fontWeight="bold">
                        Platform Content Distribution
                    </Heading>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={6}>
                        <AdminStatsCard label="Text Templates" value={stats.templatesCount} icon={<FaFileAlt />} color="teal.500" />
                        <AdminStatsCard label="Notes" value={stats.notesCount} icon={<FaStickyNote />} color="yellow.500" />
                        <AdminStatsCard label="Bookmarks" value={stats.bookmarksCount} icon={<FaBookmark />} color="cyan.500" />
                    </SimpleGrid>
                </Box>

                {/* Job Tracker Section */}
                <Box>
                    <Heading size="sm" mb={6} textTransform="uppercase" letterSpacing="widest" color="fg.muted" fontWeight="bold">
                        Job Tracker Metrics
                    </Heading>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} gap={6}>
                        <AdminStatsCard label="Total Jobs" value={stats.jobsCount} icon={<FaBriefcase />} color="gray.500" />
                        <AdminStatsCard label="Applied" value={stats.jobsApplied} icon={<FaRegClock />} color="blue.400" />
                        <AdminStatsCard label="Interviewing" value={stats.jobsInterviewing} icon={<FaSpinner />} color="yellow.400" />
                        <AdminStatsCard label="Offered" value={stats.jobsOffer} icon={<FaCheckCircle />} color="green.400" />
                        <AdminStatsCard label="Rejected" value={stats.jobsRejected} icon={<FaTimesCircle />} color="red.400" />
                    </SimpleGrid>
                </Box>

                {/* Trends & Analytics Visualizations */}
                <Box mb={8}>
                    <Heading size="sm" mb={6} textTransform="uppercase" letterSpacing="widest" color="fg.muted" fontWeight="bold">
                        Lifetime Monthly Activity
                    </Heading>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>

                        {/* User Signups Area Chart */}
                        <Box
                            p={6} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg.panel" boxShadow="md"
                            transition="all 0.3s ease" _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                        >
                            <Heading size="md" mb={6} fontWeight="extrabold">Monthly New Registrations</Heading>
                            <Box h="300px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3182CE" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3182CE" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} minTickGap={20} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} fontSize={12} domain={[0, (dataMax: number) => Math.max(dataMax, 5)]} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="users" name="New Users" stroke="#3182CE" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>

                        {/* Templates Log */}
                        <Box
                            p={6} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg.panel" boxShadow="md"
                            transition="all 0.3s ease" _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                        >
                            <Heading size="md" mb={6} fontWeight="extrabold">Templates Activity</Heading>
                            <Box h="300px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTemplatesCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#319795" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#319795" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="colorTemplatesUpdated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D69E2E" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#D69E2E" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} minTickGap={20} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} fontSize={12} domain={[0, (dataMax: number) => Math.max(dataMax, 5)]} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" dataKey="templatesCreated" name="Created" stroke="#319795" strokeWidth={3} fillOpacity={1} fill="url(#colorTemplatesCreated)" />
                                        <Area type="monotone" dataKey="templatesUpdated" name="Updated" stroke="#D69E2E" strokeWidth={3} fillOpacity={1} fill="url(#colorTemplatesUpdated)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>

                        {/* Notes Log */}
                        <Box
                            p={6} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg.panel" boxShadow="md"
                            transition="all 0.3s ease" _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                        >
                            <Heading size="md" mb={6} fontWeight="extrabold">Notes Activity</Heading>
                            <Box h="300px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorNotesCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D69E2E" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#D69E2E" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="colorNotesUpdated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#E53E3E" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} minTickGap={20} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} fontSize={12} domain={[0, (dataMax: number) => Math.max(dataMax, 5)]} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" dataKey="notesCreated" name="Created" stroke="#D69E2E" strokeWidth={3} fillOpacity={1} fill="url(#colorNotesCreated)" />
                                        <Area type="monotone" dataKey="notesUpdated" name="Updated" stroke="#E53E3E" strokeWidth={3} fillOpacity={1} fill="url(#colorNotesUpdated)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>

                        {/* Bookmarks Log */}
                        <Box
                            p={6} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg.panel" boxShadow="md"
                            transition="all 0.3s ease" _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                        >
                            <Heading size="md" mb={6} fontWeight="extrabold">Bookmarks Activity</Heading>
                            <Box h="300px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBookmarksCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00B5D8" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#00B5D8" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="colorBookmarksUpdated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3182CE" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#3182CE" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} minTickGap={20} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} fontSize={12} domain={[0, (dataMax: number) => Math.max(dataMax, 5)]} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" dataKey="bookmarksCreated" name="Created" stroke="#00B5D8" strokeWidth={3} fillOpacity={1} fill="url(#colorBookmarksCreated)" />
                                        <Area type="monotone" dataKey="bookmarksUpdated" name="Updated" stroke="#3182CE" strokeWidth={3} fillOpacity={1} fill="url(#colorBookmarksUpdated)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>

                        {/* Jobs Log */}
                        <Box
                            p={6} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg.panel" boxShadow="md"
                            transition="all 0.3s ease" _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                            gridColumn={{ base: "auto", lg: "span 2" }}
                        >
                            <Heading size="md" mb={6} fontWeight="extrabold">Job Applications Activity</Heading>
                            <Box h="300px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorJobsCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#805AD5" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#805AD5" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="colorJobsUpdated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#48BB78" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#48BB78" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} minTickGap={20} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} fontSize={12} domain={[0, (dataMax: number) => Math.max(dataMax, 5)]} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" dataKey="jobsCreated" name="Created" stroke="#805AD5" strokeWidth={3} fillOpacity={1} fill="url(#colorJobsCreated)" />
                                        <Area type="monotone" dataKey="jobsUpdated" name="Updated" stroke="#48BB78" strokeWidth={3} fillOpacity={1} fill="url(#colorJobsUpdated)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>

                    </SimpleGrid>
                </Box>

            </Flex>
        </Flex>
    );
};

export default AdminPanel;
