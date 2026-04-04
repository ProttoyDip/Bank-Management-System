import { useState, useEffect } from "react";
import { cardService, type Card, type CardApplication } from "../services/cardService";
import { useAuth } from "../context/AuthContext";
import "../styles/cardPage.css";

export default function CardPage() {
    const { user } = useAuth();
    const [card, setCard] = useState<Card | null>(null);
    const [application, setApplication] = useState<CardApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchCardData();
    }, []);

    const fetchCardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch card details
            const cardResponse = await cardService.getMyCard();
            if (cardResponse.card) {
                setCard(cardResponse.card);
            }

            // Fetch application status
            const appResponse = await cardService.getApplicationStatus();
            if (appResponse.application) {
                setApplication(appResponse.application);
            }
        } catch (err: any) {
            console.error("Error fetching card data:", err);
            setError(err.response?.data?.error || "Failed to load card data");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyForCard = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await cardService.applyForCard();
            setSuccess(response.message);
            setApplication({
                id: response.applicationId,
                userId: user?.id || 0,
                userName: user?.name || "",
                userEmail: user?.email || "",
                status: "pending",
                createdAt: new Date().toISOString(),
            });
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            console.error("Error applying for card:", err);
            setError(err.response?.data?.error || "Failed to apply for card");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card-page">
                <div className="loading">Loading card information...</div>
            </div>
        );
    }

    return (
        <div className="card-page">
            <div className="card-container">
                <h1>My Card</h1>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* If user has no active card */}
                {!card && !application && (
                    <div className="card-section no-card">
                        <div className="card-content">
                            <h2>No Card Found</h2>
                            <p>You don't have an active card yet.</p>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleApplyForCard}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Apply for Card"}
                            </button>
                        </div>
                    </div>
                )}

                {/* If application is pending */}
                {application && application.status === "pending" && !card && (
                    <div className="card-section pending">
                        <div className="card-content">
                            <h2>Application Pending</h2>
                            <p>Your card application is under review.</p>
                            <div className="app-info">
                                <p>
                                    <strong>Application Date:</strong>{" "}
                                    {new Date(application.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span className="status-badge pending">Pending</span>
                                </p>
                            </div>
                            <p className="info-text">
                                You will be notified once your application is reviewed.
                            </p>
                        </div>
                    </div>
                )}

                {/* If application was rejected */}
                {application && application.status === "rejected" && (
                    <div className="card-section rejected">
                        <div className="card-content">
                            <h2>Application Rejected</h2>
                            <div className="app-info">
                                <p>
                                    <strong>Reason:</strong> {application.reason || "Not specified"}
                                </p>
                            </div>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleApplyForCard}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Apply Again"}
                            </button>
                        </div>
                    </div>
                )}

                {/* If user has an active card */}
                {card && (
                    <div className="card-section card-details">
                        <div className="card-visual">
                            <div className="card-chip">💳</div>
                            <div className="card-number">{card.cardNumber}</div>
                            <div className="card-holder">{user?.name}</div>
                            <div className="card-footer">
                                <div>
                                    <p className="label">Valid Thru</p>
                                    <p className="value">
                                        {new Date(card.expiryDate).toLocaleDateString("en-US", {
                                            month: "2-digit",
                                            year: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="label">Status</p>
                                    <p className={`status-badge ${card.status.toLowerCase()}`}>
                                        {card.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-info">
                            <h2>Card Details</h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Card Number</label>
                                    <p>{card.cardNumber}</p>
                                </div>
                                <div className="info-item">
                                    <label>Card Type</label>
                                    <p>{card.cardType}</p>
                                </div>
                                <div className="info-item">
                                    <label>Expiry Date</label>
                                    <p>
                                        {new Date(card.expiryDate).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <p className={`status-badge ${card.status.toLowerCase()}`}>
                                        {card.status}
                                    </p>
                                </div>
                                <div className="info-item">
                                    <label>Issued Date</label>
                                    <p>
                                        {new Date(card.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="security-note">
                                <p>
                                    <strong>Security Note:</strong> Never share your card number, expiry date, or CVV with anyone.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
