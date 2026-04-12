import api from "./api";

// Types
export interface Card {
    id: number;
    cardNumber: string;
    cardType: string;
    expiryDate: string;
    status: string;
    createdAt: string;
}

export interface CardApplication {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    status: string;
    reason?: string | null;
    createdAt: string;
}

export interface CardStats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

// Customer API calls
export const cardService = {
    // Apply for a new card
    async applyForCard() {
        try {
            const response = await api.post("/card/apply");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get user's card
    async getMyCard() {
        try {
            const response = await api.get("/card/my-card");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get application status
    async getApplicationStatus() {
        try {
            const response = await api.get("/card/application-status");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Admin API calls

    // Get all pending applications
    async getAllApplications() {
        try {
            const response = await api.get("/card/applications");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get card statistics
    async getCardStats() {
        try {
            const response = await api.get("/card/stats");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Approve card application
    async approveApplication(applicationId: number) {
        try {
            const response = await api.post(`/card/approve/${applicationId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reject card application
    async rejectApplication(applicationId: number, reason: string) {
        try {
            const response = await api.post(`/card/reject/${applicationId}`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
