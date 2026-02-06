import { type User, type InsertUser, type Student, type InsertStudent, type Document, type InsertDocument } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  
  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private students: Map<string, Student>;
  private documents: Map<string, Document>;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.documents = new Map();
    
    // Seed some initial student data for testing
    this.seedData();
  }

  private seedData() {
    const sampleStudents: Student[] = [
      {
        id: randomUUID(),
        name: "Jordan Lee",
        email: "jordan.lee@academy.com",
        role: "Junior Tech",
        type: "Student",
        placementStart: new Date("2023-08-01"),
        placementEnd: new Date("2024-02-01"),
        supervisor: "Alex Miller",
        department: "Front-end Shop",
        skills: JSON.stringify(["Brake Systems", "Electrical Diagnostics", "Oil Changes"]),
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Taylor Reed",
        email: "taylor.reed@academy.com",
        role: "Intern",
        type: "Intern",
        placementStart: new Date("2023-09-01"),
        placementEnd: new Date("2024-03-01"),
        supervisor: "Sam Knight",
        department: "Diagnostics",
        skills: JSON.stringify(["Engine Diagnostics", "Electrical Systems"]),
        status: "Active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Chris Morgan",
        email: "chris.morgan@academy.com",
        role: "Senior Student",
        type: "Student",
        placementStart: new Date("2023-06-01"),
        placementEnd: new Date("2024-01-15"),
        supervisor: "Alex Miller",
        department: "General Maintenance",
        skills: JSON.stringify(["Tire Service", "Brake Systems", "Fluid Changes", "Inspections"]),
        status: "Completed",
        createdAt: new Date(),
      },
    ];

    sampleStudents.forEach(student => {
      this.students.set(student.id, student);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = {
      ...insertStudent,
      id,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      generatedDate: new Date(),
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const storage = new MemStorage();
