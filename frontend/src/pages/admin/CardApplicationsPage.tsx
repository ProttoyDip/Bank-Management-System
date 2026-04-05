import { useState, useEffect } from "react";
import { cardService, type CardApplication, type CardStats } from "../../services/cardService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/cardApplicationsPage.css";

export default function CardApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<CardApplication[]>([]);
    const [stats, setStats] = useState<CardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
    const [showRejectForm, setShowRejectForm] = useState<number | null>(null);

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await cardService.getAllApplications();
            setApplications(response.applications || []);
        } catch (err: any) {
            console.error("Error fetching applications:", err);
            setError(err.response?.data?.error || "Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await cardService.getCardStats();
            setStats(response.stats);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const handleApprove = async (applicationId: number) => {
        try {
            setLoading(true);
            setError(null);
            await cardService.approveApplication(applicationId);
            setSuccess("Card application approved successfully!");
            setApplications((prev) => prev.filter((app) => app.id !== applicationId));
            fetchStats();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            console.error("Error approving application:", err);
            setError(err.response?.data?.error || "Failed to approve application");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectClick = (applicationId: number) => {
        setShowRejectForm(applicationId);
    };

    const handleReject = async (applicationId: number) => {
        const reason = rejectReason[applicationId]?.trim();
        if (!reason) {
            setError("Please provide a rejection reason");
            return;
        }

        try {
            setRejectingId(applicationId);
            setError(null);
            await cardService.rejectApplication(applicationId, reason);
            setSuccess("Card application rejected successfully!");
            setApplications((prev) => prev.filter((app) => app.id !== applicationId));
            setRejectReason((prev) => {
                const updated = { ...prev };
                delete updated[applicationId];
                return updated;
            });
            setShowRejectForm(null);
            fetchStats();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            console.error("Error rejecting application:", err);
            setError(err.response?.data?.error || "Failed to reject application");
        } finally {
            setRejectingId(null);
        }
    };

    const handleCancelReject = () => {
        setShowRejectForm(null);
    };

    // Authorization check
    if (user && user.role?.toUpperCase() !== "ADMIN" && user.role?.toUpperCase() !== "EMPLOYEE") {
        return (
            <div className="card-applications-page">
                <div className="unauthorized">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card-applications-page">
            <div className="applications-container">
                <div className="header">
                    <h1>Card Applications</h1>
                    <button className="btn btn-refresh" onClick={() => { fetchApplications(); fetchStats(); }}>
                        🔄 Refresh
                    </button>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card pending">
                            <div className="stat-number">{stats.pending}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-card approved">
                            <div className="stat-number">{stats.approved}</div>
                            <div className="stat-label">Approved</div>
                        </div>
                        <div className="stat-card rejected">
                            <div className="stat-number">{stats.rejected}</div>
                            <div className="stat-label">Rejected</div>
                        </div>
                        <div className="stat-card total">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Total</div>
                        </div>
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Loading State */}
                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading applications...</p>
                    </div>
                )}

                {/* No Applications */}
                {!loading && applications.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h2>No Pending Applications</h2>
                        <p>All card applications have been reviewed.</p>
                    </div>
                )}

                {/* Applications Table */}
                {!loading && applications.length > 0 && (
                    <div className="applications-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Application Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id}>
                                        <td className="id">#{app.id}</td>
                                        <td className="name">{app.userName}</td>
                                        <td className="email">{app.userEmail}</td>
                                        <td className="date">
                                            {new Date(app.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="status">
                                            <span className="status-badge pending">{app.status}</span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn btn-approve"
                                                onClick={() => handleApprove(app.id)}
                                                disabled={loading}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="btn btn-reject"
                                                onClick={() => handleRejectClick(app.id)}
                                                disabled={loading}
                                            >
                                                ✕ Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Reject Form Modal */}
                        {showRejectForm && (
                            <div className="modal-overlay" onClick={handleCancelReject}>
                                <div className="modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h2>Reject Application</h2>
                                        <button className="close-btn" onClick={handleCancelReject}>
                                            ✕
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <label htmlFor="reject-reason">Rejection Reason:</label>
                                        <textarea
                                            id="reject-reason"
                                            placeholder="Enter reason for rejection..."
                                            value={rejectReason[showRejectForm] || ""}
                                            onChange={(e) =>
                                                setRejectReason((prev) => ({
                                                    ...prev,
                                                    [showRejectForm]: e.target.value,
                                                }))
                                            }
                                            rows={4}
                                        ></textarea>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={handleCancelReject}>
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(showRejectForm)}
                                            disabled={rejectingId !== null}
                                        >
                                            {rejectingId === showRejectForm ? "Rejecting..." : "Confirm Rejection"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
