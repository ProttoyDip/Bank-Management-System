import api from "./api";
import { Notification, NotificationType, UserRole } from "../types";

// Fetch notifications based on user role
// This service can be extended when backend notification endpoints are added
export const notificationService = {
  // Get notifications for customers (based on recent transactions)
  async getCustomerNotifications(userId: number): Promise<Notification[]> {
    try {
      // Get recent transactions for the user's accounts
      const response = await api.get(`/transactions/user/${userId}?limit=5`);
      const transactions = response.data.data || response.data || [];
      
      return transactions.map((tx: any, index: number) => ({
        id: tx.id || index,
        title: getTransactionTitle(tx.type),
        message: `${tx.type}: $${tx.amount.toLocaleString()} - ${tx.description || 'No description'}`,
        type: NotificationType.TRANSACTION,
        isRead: false,
        createdAt: tx.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      return getDefaultCustomerNotifications();
    }
  },

  // Get notifications for employees (recent loan applications, new accounts)
  async getEmployeeNotifications(): Promise<Notification[]> {
    try {
      // Get recent pending loans
      const loansResponse = await api.get("/loans?status=Pending");
      const pendingLoans = loansResponse.data.data || loansResponse.data || [];
      
      // Get recent accounts
      const accountsResponse = await api.get("/accounts?isActive=true");
      const accounts = accountsResponse.data.data || accountsResponse.data || [];
      
      const notifications: Notification[] = [];
      
      // Add pending loan notifications
      pendingLoans.slice(0, 3).forEach((loan: any, index: number) => {
        notifications.push({
          id: loan.id || index + 1000,
          title: "Pending Loan Application",
          message: `${loan.type} loan of $${loan.amount.toLocaleString()} awaiting approval`,
          type: NotificationType.LOAN,
          isRead: false,
          createdAt: loan.createdAt || new Date().toISOString(),
        });
      });
      
      // Add account notifications
      accounts.slice(0, 2).forEach((account: any, index: number) => {
        notifications.push({
          id: account.id || index + 2000,
          title: "New Account Created",
          message: `Account ${account.accountNumber} (${account.type}) has been created`,
          type: NotificationType.ACCOUNT,
          isRead: false,
          createdAt: account.createdAt || new Date().toISOString(),
        });
      });
      
      return notifications;
    } catch (error) {
      console.error("Error fetching employee notifications:", error);
      return getDefaultEmployeeNotifications();
    }
  },

  // Get notifications for admin (system alerts, pending approvals)
  async getAdminNotifications(): Promise<Notification[]> {
    try {
      // Get pending loans
      const loansResponse = await api.get("/loans?status=Pending");
      const pendingLoans = loansResponse.data.data || loansResponse.data || [];
      
      // Get users count for system overview
      const usersResponse = await api.get("/users");
      const users = usersResponse.data.data || usersResponse.data || [];
      
      const notifications: Notification[] = [];
      
      // Add pending loan notifications
      pendingLoans.slice(0, 3).forEach((loan: any, index: number) => {
        notifications.push({
          id: loan.id || index + 1000,
          title: "Loan Requires Approval",
          message: `${loan.type} loan - $${loan.amount.toLocaleString()} needs review`,
          type: NotificationType.LOAN,
          isRead: false,
          createdAt: loan.createdAt || new Date().toISOString(),
        });
      });
      
      // Add system notification
      if (users.length > 0) {
        notifications.push({
          id: 9999,
          title: "System Status",
          message: `System running normally. ${users.length} registered users.`,
          type: NotificationType.SYSTEM,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
      
      return notifications;
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      return getDefaultAdminNotifications();
    }
  },
};

// Helper functions
function getTransactionTitle(type: string): string {
  switch (type) {
    case "Deposit":
      return "Money Deposited";
    case "Withdraw":
      return "Money Withdrawn";
    case "Transfer In":
      return "Funds Received";
    case "Transfer Out":
      return "Funds Transferred";
    case "Loan Disbursement":
      return "Loan Disbursed";
    case "Loan Payment":
      return "Loan Payment Received";
    default:
      return "Transaction Update";
  }
}

// Default fallback notifications when API fails
function getDefaultCustomerNotifications(): Notification[] {
  return [
    {
      id: 1,
      title: "Welcome!",
      message: "Your account is ready to use",
      type: NotificationType.SYSTEM,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultEmployeeNotifications(): Notification[] {
  return [
    {
      id: 1,
      title: "Pending Loans",
      message: "Review pending loan applications",
      type: NotificationType.LOAN,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "New Accounts",
      message: "Monitor new account registrations",
      type: NotificationType.ACCOUNT,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultAdminNotifications(): Notification[] {
  return [
    {
      id: 1,
      title: "System Overview",
      message: "All systems operational",
      type: NotificationType.SYSTEM,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Pending Approvals",
      message: "Review pending loan applications",
      type: NotificationType.LOAN,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Account Activity",
      message: "Monitor new account registrations",
      type: NotificationType.ACCOUNT,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export default notificationService;

