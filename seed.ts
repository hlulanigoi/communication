import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./shared/schema";

const client = new Client({
  user: "postgres",
  host: "localhost",
  port: 5432,
  database: "communication",
});

async function seed() {
  try {
    await client.connect();
    console.log("✓ Connected to database");

    const db = drizzle(client, { schema });

    // Clear existing data (optional - comment out to keep data)
    console.log("🧹 Clearing existing data...");
    await client.query("TRUNCATE TABLE testimonials CASCADE");
    await client.query("TRUNCATE TABLE documents CASCADE");
    await client.query("TRUNCATE TABLE job_invoices CASCADE");
    await client.query("TRUNCATE TABLE jobs CASCADE");
    await client.query("TRUNCATE TABLE vehicle_inspections CASCADE");
    await client.query("TRUNCATE TABLE inspection_media CASCADE");
    await client.query("TRUNCATE TABLE vehicles CASCADE");
    await client.query("TRUNCATE TABLE purchase_orders CASCADE");
    await client.query("TRUNCATE TABLE suppliers CASCADE");
    await client.query("TRUNCATE TABLE clients CASCADE");
    await client.query("TRUNCATE TABLE staff CASCADE");
    await client.query("TRUNCATE TABLE students CASCADE");
    await client.query("TRUNCATE TABLE users CASCADE");
    console.log("✓ Cleared existing data");

    // Seed Users
    console.log("\nSeeding users...");
    const users = await db
      .insert(schema.users)
      .values([
        {
          id: "user-1",
          username: "admin",
          password: "hashed_password_123",
        },
        {
          id: "user-2",
          username: "supervisor",
          password: "hashed_password_456",
        },
        {
          id: "user-3",
          username: "technician",
          password: "hashed_password_789",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${users.length} users`);

    // Seed Students
    console.log("\nSeeding students...");
    const students = await db
      .insert(schema.students)
      .values([
        {
          id: "student-1",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "Junior Tech",
          type: "Student",
          supervisor: "Jane Smith",
          department: "Technical",
          status: "Active",
        },
        {
          id: "student-2",
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          role: "Intern",
          type: "Intern",
          supervisor: "Mike Brown",
          department: "Operations",
          status: "Active",
        },
        {
          id: "student-3",
          name: "Alex Wilson",
          email: "alex.wilson@example.com",
          role: "Junior Tech",
          type: "Student",
          supervisor: "Jane Smith",
          department: "Technical",
          status: "Completed",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${students.length} students`);

    // Seed Vehicles
    console.log("\nSeeding vehicles...");
    const vehicles = await db
      .insert(schema.vehicles)
      .values([
        {
          id: "vehicle-1",
          make: "Toyota",
          model: "Camry",
          year: 2022,
          licensePlate: "ABC-1234",
          vin: "12345TOYOTA67890",
          mileage: 15000,
          status: "Active",
          lastServiceDate: new Date("2025-12-15"),
        },
        {
          id: "vehicle-2",
          make: "Honda",
          model: "Civic",
          year: 2023,
          licensePlate: "XYZ-5678",
          vin: "98765HONDA54321",
          mileage: 8000,
          status: "Active",
          lastServiceDate: new Date("2026-01-20"),
        },
        {
          id: "vehicle-3",
          make: "Ford",
          model: "F-150",
          year: 2021,
          licensePlate: "FRD-9999",
          vin: "11111FORD22222",
          mileage: 32000,
          status: "Maintenance",
          lastServiceDate: new Date("2025-11-10"),
        },
      ])
      .returning();
    console.log(`✓ Inserted ${vehicles.length} vehicles`);

    // Seed Staff
    console.log("\nSeeding staff...");
    const staff = await db
      .insert(schema.staff)
      .values([
        {
          id: "staff-1",
          name: "Jane Smith",
          role: "Manager",
          email: "jane.smith@example.com",
          phone: "+1-555-0101",
          department: "Technical",
          status: "Active",
        },
        {
          id: "staff-2",
          name: "Mike Brown",
          role: "Manager",
          email: "mike.brown@example.com",
          phone: "+1-555-0102",
          department: "Operations",
          status: "Active",
        },
        {
          id: "staff-3",
          name: "Emma Davis",
          role: "HR",
          email: "emma.davis@example.com",
          phone: "+1-555-0103",
          department: "Human Resources",
          status: "Active",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${staff.length} staff members`);

    // Seed Clients
    console.log("\nSeeding clients...");
    const clients = await db
      .insert(schema.clients)
      .values([
        {
          id: "client-1",
          name: "ABC Corporation",
          email: "contact@abc.com",
          phone: "+1-555-0001",
          source: "Corporate Fleet",
          accountType: "B2B",
          companyName: "ABC Corporation",
          status: "Active",
        },
        {
          id: "client-2",
          name: "XYZ Services Ltd",
          email: "info@xyz.com",
          phone: "+1-555-0002",
          source: "Direct",
          accountType: "B2B",
          companyName: "XYZ Services Ltd",
          status: "Active",
        },
        {
          id: "client-3",
          name: "Fleet Management Co",
          email: "fleet@example.com",
          phone: "+1-555-0003",
          source: "Corporate Fleet",
          accountType: "Partner",
          companyName: "Fleet Management Co",
          status: "Active",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${clients.length} clients`);

    // Seed Jobs
    console.log("\nSeeding jobs...");
    const jobs = await db
      .insert(schema.jobs)
      .values([
        {
          id: "job-1",
          jobNumber: "J-2026-001",
          type: "Inspection",
          description: "Complete inspection of vehicle ABC-1234",
          status: "Completed",
          priority: "High",
          vehicleId: "vehicle-1",
          clientId: "client-1",
          assignedToId: "staff-1",
          vehicleInfo: JSON.stringify({ make: "Toyota", model: "Camry", year: 2022, plate: "ABC-1234" }),
          clientName: "ABC Corporation",
          assignedToName: "Jane Smith",
          estimatedCost: "500",
          actualCost: "500",
          laborHours: "3.5",
          completedDate: new Date("2026-02-05"),
        },
        {
          id: "job-2",
          jobNumber: "J-2026-002",
          type: "Maintenance",
          description: "Oil change and filter replacement",
          status: "In Progress",
          priority: "Medium",
          vehicleId: "vehicle-2",
          clientId: "client-2",
          assignedToId: "staff-1",
          vehicleInfo: JSON.stringify({ make: "Honda", model: "Civic", year: 2023, plate: "XYZ-5678" }),
          clientName: "XYZ Services Ltd",
          assignedToName: "Jane Smith",
          estimatedCost: "150",
          laborHours: "2",
          startedDate: new Date("2026-02-10"),
        },
        {
          id: "job-3",
          jobNumber: "J-2026-003",
          type: "Repair",
          description: "Engine overhaul required",
          status: "Pending",
          priority: "High",
          vehicleId: "vehicle-3",
          clientId: "client-3",
          assignedToId: "staff-2",
          vehicleInfo: JSON.stringify({ make: "Ford", model: "F-150", year: 2021, plate: "FRD-9999" }),
          clientName: "Fleet Management Co",
          assignedToName: "Mike Brown",
          estimatedCost: "2500",
          laborHours: "16",
          scheduledDate: new Date("2026-02-15"),
        },
      ])
      .returning();
    console.log(`✓ Inserted ${jobs.length} jobs`);

    // Seed Documents
    console.log("\nSeeding documents...");
    const documents = await db
      .insert(schema.documents)
      .values([
        {
          id: "doc-1",
          title: "Employment Certificate - John Doe",
          type: "Certificate",
          category: "Student",
          fileType: "application/pdf",
          fileName: "certificate_john_doe.pdf",
          studentId: "student-1",
          studentName: "John Doe",
          uploadedBy: "admin",
        },
        {
          id: "doc-2",
          title: "Placement Letter - Sarah Johnson",
          type: "Placement Letter",
          category: "Student",
          fileType: "application/pdf",
          fileName: "placement_sarah_johnson.pdf",
          studentId: "student-2",
          studentName: "Sarah Johnson",
          uploadedBy: "admin",
        },
        {
          id: "doc-3",
          title: "Service Report - Toyota Camry",
          type: "Custom",
          category: "Vehicle",
          fileType: "application/pdf",
          fileName: "service_report_toyota.pdf",
          description: "Service report for Toyota Camry ABC-1234",
          uploadedBy: "staff-1",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${documents.length} documents`);

    // Seed Suppliers
    console.log("\nSeeding suppliers...");
    const suppliers = await db
      .insert(schema.suppliers)
      .values([
        {
          id: "supplier-1",
          name: "Auto Parts Warehouse",
          email: "sales@autoparts.com",
          phone: "+1-555-1001",
          address: "100 Warehouse Lane",
          status: "Active",
        },
        {
          id: "supplier-2",
          name: "Premium Components Ltd",
          email: "orders@premium.com",
          phone: "+1-555-1002",
          address: "200 Industrial Way",
          status: "Active",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${suppliers.length} suppliers`);

    // Seed Testimonials
    console.log("\nSeeding testimonials...");
    const testimonials = await db
      .insert(schema.testimonials)
      .values([
        {
          id: "testimonial-1",
          studentId: "student-1",
          studentName: "John Doe",
          employerName: "ABC Corporation",
          employerRole: "HR Manager",
          content:
            "John was an exceptional technician. Very professional, reliable, and always delivered quality work.",
          rating: "5",
          verified: "true",
        },
        {
          id: "testimonial-2",
          studentId: "student-2",
          studentName: "Sarah Johnson",
          employerName: "XYZ Services Ltd",
          employerRole: "Operations Manager",
          content:
            "Sarah was a quick learner and showed great initiative. She integrated well with the team.",
          rating: "5",
          verified: "true",
        },
        {
          id: "testimonial-3",
          studentId: "student-3",
          studentName: "Alex Wilson",
          employerName: "Tech Solutions Inc",
          employerRole: "Technical Director",
          content:
            "Alex demonstrated strong technical skills and good problem-solving abilities throughout the internship.",
          rating: "4",
          verified: "false",
        },
      ])
      .returning();
    console.log(`✓ Inserted ${testimonials.length} testimonials`);

    console.log("\n✅ DATABASE SEEDING COMPLETE!\n");
    console.log("Summary:");
    console.log(`  Users: ${users.length}`);
    console.log(`  Students: ${students.length}`);
    console.log(`  Vehicles: ${vehicles.length}`);
    console.log(`  Staff: ${staff.length}`);
    console.log(`  Clients: ${clients.length}`);
    console.log(`  Jobs: ${jobs.length}`);
    console.log(`  Documents: ${documents.length}`);
    console.log(`  Suppliers: ${suppliers.length}`);
    console.log(`  Testimonials: ${testimonials.length}`);
    console.log("\nYour app is ready for testing! 🚀\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
