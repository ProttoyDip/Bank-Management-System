import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { Employee } from "../entity/Employee";
import { User } from "../entity/User";

export class EmployeeController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const rows = await getDataSource()
                .createQueryBuilder(Employee, "employee")
                .leftJoin("employee.user", "user")
                .select([
                    "employee.id",
                    "employee.userId",
                    "employee.employeeId",
                    "employee.department",
                    "employee.position",
                    "employee.salary",
                    "employee.hireDate",
                    "employee.isActive",
                    "employee.createdAt",
                    "employee.dateOfBirth",
                    "employee.gender",
                    "employee.employmentType",
                    "employee.presentAddress",
                    "employee.permanentAddress",
                    "employee.branchId",
                    "employee.dailyTransactionLimit",
                    "employee.permissions",
                    "employee.updatedAt",
                    "user.id",
                    "user.name",
                    "user.email",
                    "user.phone",
                    "user.address",
                    "user.status",
                ])
                .orderBy("employee.createdAt", "DESC")
                .getRawMany();

            const employees = rows.map((row) => ({
                id: Number(row.employee_id),
                userId: Number(row.employee_userId),
                employeeId: row.employee_employeeId,
                department: row.employee_department,
                position: row.employee_position,
                salary: Number(row.employee_salary || 0),
                hireDate: row.employee_hireDate,
                isActive: Boolean(row.employee_isActive),
                dateOfBirth: row.employee_dateOfBirth || null,
                gender: row.employee_gender || null,
                employmentType: row.employee_employmentType || null,
                presentAddress: row.employee_presentAddress || null,
                permanentAddress: row.employee_permanentAddress || null,
                branchId: row.employee_branchId ? Number(row.employee_branchId) : null,
                dailyTransactionLimit: Number(row.employee_dailyTransactionLimit || 0),
                permissions: row.employee_permissions || null,
                createdAt: row.employee_createdAt,
                updatedAt: row.employee_updatedAt,
                name: row.user_name,
                email: row.user_email,
                phone: row.user_phone,
                address: row.user_address,
                status: row.user_status,
                user: {
                    id: Number(row.user_id),
                    name: row.user_name,
                    email: row.user_email,
                    phone: row.user_phone,
                    address: row.user_address,
                    status: row.user_status,
                },
            }));

            res.json({ data: employees });
        } catch (error) {
            console.error("Fetch employees error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const employee = await getDataSource()
                .createQueryBuilder(Employee, "employee")
                .leftJoin("employee.user", "user")
                .select([
                    "employee.id",
                    "employee.userId",
                    "employee.employeeId",
                    "employee.department",
                    "employee.position",
                    "employee.salary",
                    "employee.hireDate",
                    "employee.isActive",
                    "employee.createdAt",
                    "employee.dateOfBirth",
                    "employee.gender",
                    "employee.employmentType",
                    "employee.presentAddress",
                    "employee.permanentAddress",
                    "employee.branchId",
                    "employee.dailyTransactionLimit",
                    "employee.permissions",
                    "employee.updatedAt",
                    "user.id",
                    "user.name",
                    "user.email",
                    "user.phone",
                    "user.address",
                    "user.status",
                ])
                .where("employee.id = :id", { id })
                .getRawOne();

            if (!employee) {
                res.status(404).json({ error: "Employee not found" });
                return;
            }

            res.json({
                data: {
                    id: Number(employee.employee_id),
                    userId: Number(employee.employee_userId),
                    employeeId: employee.employee_employeeId,
                    department: employee.employee_department,
                    position: employee.employee_position,
                    salary: Number(employee.employee_salary || 0),
                    hireDate: employee.employee_hireDate,
                    isActive: Boolean(employee.employee_isActive),
                    dateOfBirth: employee.employee_dateOfBirth || null,
                    gender: employee.employee_gender || null,
                    employmentType: employee.employee_employmentType || null,
                    presentAddress: employee.employee_presentAddress || null,
                    permanentAddress: employee.employee_permanentAddress || null,
                    branchId: employee.employee_branchId ? Number(employee.employee_branchId) : null,
                    dailyTransactionLimit: Number(employee.employee_dailyTransactionLimit || 0),
                    permissions: employee.employee_permissions || null,
                    createdAt: employee.employee_createdAt,
                    updatedAt: employee.employee_updatedAt,
                    name: employee.user_name,
                    email: employee.user_email,
                    phone: employee.user_phone,
                    address: employee.user_address,
                    status: employee.user_status,
                    user: {
                        id: Number(employee.user_id),
                        name: employee.user_name,
                        email: employee.user_email,
                        phone: employee.user_phone,
                        address: employee.user_address,
                        status: employee.user_status,
                    },
                },
            });
        } catch (error) {
            console.error("Fetch employee error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const employeeRepository = getDataSource().getRepository(Employee);
            const id = Number(req.params.id);
            const employee = await employeeRepository
                .createQueryBuilder("employee")
                .select(["employee.id"])
                .where("employee.id = :id", { id })
                .getOne();
            if (!employee) {
                res.status(404).json({ error: "Employee not found" });
                return;
            }
            const updates = req.body;
            Object.assign(employee, updates);
            const updatedEmployee = await employeeRepository.save(employee);
            res.json({ message: "Employee updated", data: updatedEmployee });
        } catch (error) {
            console.error("Update employee error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const employeeRepository = getDataSource().getRepository(Employee);
            const id = Number(req.params.id);
            const result = await employeeRepository.delete(id);
            if (result.affected === 0) {
                res.status(404).json({ error: "Employee not found" });
                return;
            }
            res.json({ message: "Employee deleted" });
        } catch (error) {
            console.error("Delete employee error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
