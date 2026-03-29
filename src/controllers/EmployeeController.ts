import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { Employee } from "../entity/Employee";
import { User } from "../entity/User";

export class EmployeeController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const employeeRepository = getDataSource().getRepository(Employee);
            const employees = await employeeRepository.find({ 
                relations: ["user"] 
            });
            res.json({ data: employees });
        } catch (error) {
            console.error("Fetch employees error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const employeeRepository = getDataSource().getRepository(Employee);
            const id = Number(req.params.id);
            const employee = await employeeRepository.findOne({
                where: { id },
                relations: ["user"]
            });
            if (!employee) {
                res.status(404).json({ error: "Employee not found" });
                return;
            }
            res.json({ data: employee });
        } catch (error) {
            console.error("Fetch employee error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const employeeRepository = getDataSource().getRepository(Employee);
            const id = Number(req.params.id);
            const employee = await employeeRepository.findOneBy({ id });
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

