import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [applicationStats, setApplicationStats] = useState(null);
    const [scholarshipStats, setScholarshipStats] = useState(null);

    useEffect(() => {
        // Fetch dashboard data
        const fetchDashboardData = async () => {
            const [statsRes, appStatsRes, scholStatsRes] = await Promise.all([
                fetch('/api/admin/dashboard'),
                fetch('/api/admin/applications/stats'),
                fetch('/api/admin/scholarships/stats')
            ]);

            const [statsData, appStatsData, scholStatsData] = await Promise.all([
                statsRes.json(),
                appStatsRes.json(),
                scholStatsRes.json()
            ]);

            setStats(statsData);
            setApplicationStats(appStatsData);
            setScholarshipStats(scholStatsData);
        };

        fetchDashboardData();
    }, []);

    if (!stats || !applicationStats || !scholarshipStats) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Scholarships</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalScholarships}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Scholarships</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.activeScholarships}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalApplications}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Application Trends Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Application Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <LineChart
                            width={800}
                            height={250}
                            data={applicationStats.monthly}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id.month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" />
                        </LineChart>
                    </div>
                </CardContent>
            </Card>

            {/* Application Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <BarChart
                            width={800}
                            height={250}
                            data={applicationStats.byStatus}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;