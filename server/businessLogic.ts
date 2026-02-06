import { storage } from "./storage";
import { PDFGenerator } from "./pdfGenerator";

/**
 * Business Logic Workflows for JustFix Auto Electrix
 * Implements key workflows from the system design:
 * 1. Student Graduation - Auto-trigger certificate generation
 * 2. Insurance Billing - Split invoices based on client source
 * 3. HR Notifications - Auto-pin HR notes from HR managers
 */

export class BusinessLogic {
  /**
   * Student Graduation Workflow
   * When placement_end < today -> Trigger "Generate Certificate" action
   * Move Student from `Active` to `Placed/Alumni`
   */
  static async processStudentGraduations(): Promise<void> {
    try {
      const students = await storage.getStudents();
      const today = new Date();

      for (const student of students) {
        if (!student.placementEnd) continue;

        const placementEnd = new Date(student.placementEnd);
        
        // Check if placement has ended and student is still Active
        if (placementEnd < today && student.status === "Active") {
          // Update student status to Alumni
          await storage.updateStudent(student.id, {
            status: "Alumni",
          });

          // Auto-generate completion certificate
          try {
            const pdfBase64 = await PDFGenerator.generateCertificate({
              student,
              certificateType: "Completion Certificate",
              issueDate: today,
            });

            // Create document record
            const document = await storage.createDocument({
              title: `Completion Certificate - ${student.name}`,
              type: "Certificate",
              studentId: student.id,
              studentName: student.name,
              content: pdfBase64,
              metadata: JSON.stringify({
                certificateType: "Completion Certificate",
                placementDuration: {
                  start: student.placementStart,
                  end: student.placementEnd,
                },
              }),
            });

            // Create certificate record with reference to document
            await storage.createCertificate({
              studentId: student.id,
              studentName: student.name,
              type: "Completion",
              title: "Completion Certificate",
              issuerName: student.supervisor || "Academy Director",
              issuerRole: "Supervisor",
              issuedDate: today,
              documentId: document.id,
              verified: "true",
            });

            console.log(
              `[Student Graduation] Generated certificate for ${student.name}`
            );
          } catch (error) {
            console.error(
              `[Student Graduation] Error generating certificate for ${student.name}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "[Student Graduation] Error in graduation workflow:",
        error
      );
    }
  }

  /**
   * Insurance Billing Workflow
   * If ClientSource === 'Insurance' -> Split Invoice into 'Excess (Client Pay)' and 'Claim (Insurance Pay)'
   * Calculates split amounts based on insurance policy
   */
  static async calculateInsuranceBilling(invoiceData: {
    clientId: string;
    partsTotal: string;
    laborTotal: string;
    taxRate: string;
  }): Promise<{
    insuranceExcess: string;
    insuranceClaimAmount: string;
    isInsuranceJob: boolean;
  }> {
    try {
      const client = await storage.getClient(invoiceData.clientId);
      
      if (!client || client.source !== "Insurance") {
        return {
          insuranceExcess: "0",
          insuranceClaimAmount: "0",
          isInsuranceJob: false,
        };
      }

      // Parse amounts
      const partsTotal = parseFloat(invoiceData.partsTotal || "0");
      const laborTotal = parseFloat(invoiceData.laborTotal || "0");
      const taxRate = parseFloat(invoiceData.taxRate || "0") / 100;
      
      const subtotal = partsTotal + laborTotal;
      const tax = subtotal * taxRate;
      const totalAmount = subtotal + tax;

      // Standard insurance excess is 10% of labor or 15% of parts (whichever is less)
      // Can be customized per insurance company
      const excessPercentage = 0.1; // 10% default
      const insuranceExcess = (subtotal * excessPercentage).toFixed(2);
      const insuranceClaimAmount = (
        totalAmount - parseFloat(insuranceExcess)
      ).toFixed(2);

      return {
        insuranceExcess,
        insuranceClaimAmount,
        isInsuranceJob: true,
      };
    } catch (error) {
      console.error("[Insurance Billing] Error calculating insurance split:", error);
      return {
        insuranceExcess: "0",
        insuranceClaimAmount: "0",
        isInsuranceJob: false,
      };
    }
  }

  /**
   * Get invoice split details for display
   */
  static getInvoiceSplitDetails(
    totalAmount: string,
    insuranceExcess: string,
    insuranceClaimAmount: string
  ): {
    clientResponsibility: string;
    insuranceResponsibility: string;
    totalInvoice: string;
  } {
    return {
      clientResponsibility: insuranceExcess,
      insuranceResponsibility: insuranceClaimAmount,
      totalInvoice: totalAmount,
    };
  }

  /**
   * HR Notification Workflow
   * If Note.author === 'HR Manager' -> Pin to Admin Dashboard for 24 hours
   * Auto-unpin after expiration
   */
  static async createHRNotification(noteData: {
    authorId: string;
    authorName: string;
    content: string;
    targetAudience?: string;
    priority?: string;
    category?: string;
  }): Promise<{
    isPinned: boolean;
    pinnedDurationHours: number;
  }> {
    try {
      const author = await storage.getStaffMember(noteData.authorId);

      // Check if author is HR Manager or HR Director
      const isHRStaff =
        author && (author.role === "HR Manager" || author.role === "HR");

      if (!isHRStaff) {
        return {
          isPinned: false,
          pinnedDurationHours: 0,
        };
      }

      // Auto-pin for 24 hours if from HR
      const pinnedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const note = await storage.createHRNote({
        ...noteData,
        isPinned: "true",
        pinnedUntil,
        priority: noteData.priority || "Normal",
        category: noteData.category || "Announcement",
        targetAudience: noteData.targetAudience || "All",
      });

      console.log(
        `[HR Notification] Auto-pinned notification from ${noteData.authorName} for 24 hours`
      );

      return {
        isPinned: true,
        pinnedDurationHours: 24,
      };
    } catch (error) {
      console.error("[HR Notification] Error creating HR notification:", error);
      return {
        isPinned: false,
        pinnedDurationHours: 0,
      };
    }
  }

  /**
   * Get expiring pinned notes (those expiring in next 2 hours)
   */
  static async getExpiringPinnedNotes(): Promise<
    Array<{
      id: string;
      content: string;
      authorName: string;
      expiresIn: string;
    }>
  > {
    try {
      const pinnedNotes = await storage.getPinnedHRNotes();
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      return pinnedNotes
        .filter((note: any) => {
          if (!note.pinnedUntil) return false;
          const pinnedUntil = new Date(note.pinnedUntil);
          return pinnedUntil <= twoHoursFromNow && pinnedUntil > now;
        })
        .map((note: any) => ({
          id: note.id,
          content: note.content,
          authorName: note.authorName,
          expiresIn:
            note.pinnedUntil &&
            Math.round(
              (new Date(note.pinnedUntil).getTime() - now.getTime()) /
                (60 * 1000)
            ) + " minutes",
        }));
    } catch (error) {
      console.error("[HR Notification] Error getting expiring notes:", error);
      return [];
    }
  }

  /**
   * Run all scheduled business logic tasks
   * Should be called periodically (e.g., every hour)
   */
  static async runScheduledTasks(): Promise<void> {
    console.log("[Business Logic] Running scheduled tasks...");
    
    try {
      // Check for student graduations
      await this.processStudentGraduations();
      
      // Check for expiring pinned notes
      const expiringNotes = await this.getExpiringPinnedNotes();
      if (expiringNotes.length > 0) {
        console.log(`[Business Logic] ${expiringNotes.length} HR notes expiring soon`);
      }
      
      console.log("[Business Logic] Scheduled tasks completed");
    } catch (error) {
      console.error("[Business Logic] Error running scheduled tasks:", error);
    }
  }
}

// Export default instance for easy usage
export default BusinessLogic;
