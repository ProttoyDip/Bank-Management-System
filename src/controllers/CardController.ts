import { Response } from "express";
import { getDataSource } from "../data-source";
import { Card } from "../entity/Card";
import { CardApplication } from "../entity/CardApplication";
import { User } from "../entity/User";
import { AuthRequest } from "../middleware/auth";

// Utility functions
const generateCardNumber = (): string => {
    return Math.floor(Math.random() * 9000000000000000 + 1000000000000000).toString();
};

const generateCVV = (): string => {
    return Math.floor(Math.random() * 900 + 100).toString();
};

const calculateExpiryDate = (): Date => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return date;
};

const maskCardNumber = (cardNumber: string): string => {
    return `**** **** **** ${cardNumber.slice(-4)}`;
};

export class CardController {
    // Apply for a new card
    static async applyForCard(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const userId = req.user.id;
            const cardAppRepo = getDataSource().getRepository(CardApplication);
            const cardRepo = getDataSource().getRepository(Card);

            // Check if user already has an active card
            const existingCard = await cardRepo.findOne({
                where: { user_id: userId, status: "Active" },
            });

            if (existingCard) {
                res.status(400).json({ error: "You already have an active card" });
                return;
            }

            // Check if there's already a pending application
            const pendingApp = await cardAppRepo.findOne({
                where: { user_id: userId, status: "pending" },
            });

            if (pendingApp) {
                res.status(400).json({ error: "You already have a pending card application" });
                return;
            }

            // Create new application
            const newApplication = new CardApplication();
            newApplication.user_id = userId;
            newApplication.status = "pending";

            await cardAppRepo.save(newApplication);

            res.status(201).json({
                success: true,
                message: "Card application submitted successfully",
                applicationId: newApplication.id,
            });
        } catch (error) {
            console.error("Error applying for card:", error);
            res.status(500).json({ error: "Failed to apply for card" });
        }
    }

    // Get user's card
    static async getMyCard(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const userId = req.user.id;
            const cardRepo = getDataSource().getRepository(Card);

            const card = await cardRepo.findOne({
                where: { user_id: userId, status: "Active" },
            });

            if (!card) {
                res.status(404).json({ card: null, message: "No active card found" });
                return;
            }

            res.status(200).json({
                card: {
                    id: card.id,
                    cardNumber: maskCardNumber(card.card_number),
                    cardType: card.card_type,
                    expiryDate: card.expiry_date,
                    status: card.status,
                    createdAt: card.created_at,
                },
            });
        } catch (error) {
            console.error("Error fetching card:", error);
            res.status(500).json({ error: "Failed to fetch card" });
        }
    }

    // Get user's card application status
    static async getApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const userId = req.user.id;
            const cardAppRepo = getDataSource().getRepository(CardApplication);

            const application = await cardAppRepo.findOne({
                where: { user_id: userId },
                order: { createdAt: "DESC" },
            });

            res.status(200).json({
                application: application || null,
            });
        } catch (error) {
            console.error("Error fetching application status:", error);
            res.status(500).json({ error: "Failed to fetch application status" });
        }
    }

    // Get all pending card applications (Admin only)
    static async getAllApplications(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const role = String(req.user.role || "").toUpperCase();
            if (role !== "ADMIN" && role !== "EMPLOYEE") {
                res.status(403).json({ error: "Admin access required" });
                return;
            }

            const cardAppRepo = getDataSource().getRepository(CardApplication);
            const userRepo = getDataSource().getRepository(User);

            const applications = await cardAppRepo.find({
                order: { createdAt: "DESC" },
                where: { status: "pending" },
            });

            // Fetch user details for each application
            const applicationsWithUserInfo = await Promise.all(
                applications.map(async (app) => {
                    const user = await userRepo.findOne({ where: { id: app.user_id } });
                    return {
                        id: app.id,
                        userId: app.user_id,
                        userName: user?.name,
                        userEmail: user?.email,
                        status: app.status,
                        createdAt: app.createdAt,
                    };
                })
            );

            res.status(200).json({
                applications: applicationsWithUserInfo,
                count: applicationsWithUserInfo.length,
            });
        } catch (error) {
            console.error("Error fetching applications:", error);
            res.status(500).json({ error: "Failed to fetch applications" });
        }
    }

    // Approve card application (Admin only)
    static async approveApplication(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const role = String(req.user.role || "").toUpperCase();
            if (role !== "ADMIN" && role !== "EMPLOYEE") {
                res.status(403).json({ error: "Admin access required" });
                return;
            }

            const applicationId = parseInt(req.params.id as string, 10);
            if (isNaN(applicationId)) {
                res.status(400).json({ error: "Invalid application ID" });
                return;
            }

            const cardAppRepo = getDataSource().getRepository(CardApplication);
            const cardRepo = getDataSource().getRepository(Card);

            const application = await cardAppRepo.findOne({
                where: { id: applicationId },
            });

            if (!application) {
                res.status(404).json({ error: "Application not found" });
                return;
            }

            if (application.status !== "pending") {
                res.status(400).json({ error: "Only pending applications can be approved" });
                return;
            }

            // Generate card details
            const cardNumber = generateCardNumber();
            const cvv = generateCVV();
            const expiryDate = calculateExpiryDate();

            // Create new card
            const newCard = new Card();
            newCard.user_id = application.user_id;
            newCard.card_number = cardNumber;
            newCard.card_type = "Debit";
            newCard.expiry_date = expiryDate;
            newCard.cvv = cvv;
            newCard.status = "Active";

            await cardRepo.save(newCard);

            // Update application status
            application.status = "approved";
            await cardAppRepo.save(application);

            res.status(200).json({
                success: true,
                message: "Card application approved successfully",
                card: {
                    id: newCard.id,
                    cardNumber: maskCardNumber(newCard.card_number),
                    cardType: newCard.card_type,
                    expiryDate: newCard.expiry_date,
                    cvv: newCard.cvv,
                    status: newCard.status,
                },
            });
        } catch (error) {
            console.error("Error approving application:", error);
            res.status(500).json({ error: "Failed to approve application" });
        }
    }

    // Reject card application (Admin only)
    static async rejectApplication(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const role = String(req.user.role || "").toUpperCase();
            if (role !== "ADMIN" && role !== "EMPLOYEE") {
                res.status(403).json({ error: "Admin access required" });
                return;
            }

            const applicationId = parseInt(req.params.id as string, 10);
            if (isNaN(applicationId)) {
                res.status(400).json({ error: "Invalid application ID" });
                return;
            }

            const { reason } = req.body;
            if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
                res.status(400).json({ error: "Rejection reason is required" });
                return;
            }

            const cardAppRepo = getDataSource().getRepository(CardApplication);
            const application = await cardAppRepo.findOne({
                where: { id: applicationId },
            });

            if (!application) {
                res.status(404).json({ error: "Application not found" });
                return;
            }

            if (application.status !== "pending") {
                res.status(400).json({ error: "Only pending applications can be rejected" });
                return;
            }

            // Update application status
            application.status = "rejected";
            application.reason = reason.trim();
            await cardAppRepo.save(application);

            res.status(200).json({
                success: true,
                message: "Card application rejected successfully",
                applicationId: application.id,
            });
        } catch (error) {
            console.error("Error rejecting application:", error);
            res.status(500).json({ error: "Failed to reject application" });
        }
    }

    // Get all approvals (Admin dashboard)
    static async getApplicationStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const role = String(req.user.role || "").toUpperCase();
            if (role !== "ADMIN" && role !== "EMPLOYEE") {
                res.status(403).json({ error: "Admin access required" });
                return;
            }

            const cardAppRepo = getDataSource().getRepository(CardApplication);

            const pending = await cardAppRepo.count({ where: { status: "pending" } });
            const approved = await cardAppRepo.count({ where: { status: "approved" } });
            const rejected = await cardAppRepo.count({ where: { status: "rejected" } });

            res.status(200).json({
                stats: {
                    pending,
                    approved,
                    rejected,
                    total: pending + approved + rejected,
                },
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            res.status(500).json({ error: "Failed to fetch statistics" });
        }
    }
}
