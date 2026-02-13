import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Clock,
  Award,
  FileText,
} from "lucide-react";
import type { Staff, LeaveRequest, PayrollRecord, PerformanceReview } from "@shared/schema";

const API_BASE = "http://localhost:5000/api";

export default function EmployeeDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/employee/:id");
  const employeeId = params?.id;

  const [employee, setEmployee] = useState<Staff | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Staff>>({});

  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);

      // Load employee details
      const empRes = await fetch(`${API_BASE}/staff/${employeeId}`);
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployee(empData);
        setFormData(empData);
      }

      // Load leave requests
      const leaveRes = await fetch(`${API_BASE}/leave-requests/staff/${employeeId}`);
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaves(leaveData);
      }

      // Load payroll
      const payrollRes = await fetch(`${API_BASE}/payroll/staff/${employeeId}`);
      if (payrollRes.ok) {
        const payrollData = await payrollRes.json();
        setPayroll(payrollData);
      }

      // Load reviews
      const reviewRes = await fetch(`${API_BASE}/performance-reviews/staff/${employeeId}`);
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setReviews(reviewData);
      }
    } catch (err) {
      console.error("Error loading employee data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE}/staff/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployee(updatedEmployee);
        setEditing(false);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <div className="p-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/hr")}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to HR
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Employee not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalLeavesTaken = leaves.filter((l) => l.status === "Approved").length;
  const totalPayments = payroll.length;
  const totalReviews = reviews.length;

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/hr")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to HR
          </Button>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData(employee);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Employee Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{employee.name}</CardTitle>
                <p className="text-gray-600 mt-2">{employee.role}</p>
              </div>
              <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                {employee.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{employee.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{employee.department || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Hire Date</p>
                    <p className="font-medium">
                      {employee.hireDate
                        ? new Date(employee.hireDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Pay Rate</p>
                    <p className="font-medium">{employee.payRate || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Efficiency Score</p>
                    <p className="font-medium">{employee.efficiencyScore || "0"}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Leaves Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalLeavesTaken}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Payroll Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReviews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Details Tabs */}
        <Tabs defaultValue="leave">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leave">Leave History</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="reviews">Performance</TabsTrigger>
          </TabsList>

          {/* Leave History Tab */}
          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No leave requests</p>
                ) : (
                  <div className="space-y-3">
                    {leaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">{leave.leaveType}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(leave.startDate).toLocaleDateString()} to{" "}
                            {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {leave.numberOfDays} days
                          </p>
                        </div>
                        <Badge
                          variant={
                            leave.status === "Pending"
                              ? "outline"
                              : leave.status === "Approved"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Records</CardTitle>
              </CardHeader>
              <CardContent>
                {payroll.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No payroll records</p>
                ) : (
                  <div className="space-y-3">
                    {payroll.map((record) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">
                            {new Date(record.payPeriodStart).toLocaleDateString(
                              undefined,
                              { month: "short", year: "numeric" }
                            )}
                          </p>
                          <Badge
                            variant={
                              record.paymentStatus === "Pending"
                                ? "outline"
                                : "default"
                            }
                          >
                            {record.paymentStatus}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Gross Salary</p>
                            <p className="font-semibold">${record.grossSalary}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Net Salary</p>
                            <p className="font-bold text-green-600">${record.netSalary}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No performance reviews</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            Review by {review.reviewerName}
                          </p>
                          <Badge>{review.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(review.reviewPeriodStart).toLocaleDateString()} to{" "}
                          {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Overall Rating</p>
                            <p className="font-bold text-lg">
                              {review.overallRating}/5
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-600">Ratings</p>
                            <p className="text-xs">Technical: {review.technicalSkills}/5</p>
                            <p className="text-xs">Communication: {review.communication}/5</p>
                          </div>
                        </div>
                        {review.strengths && (
                          <div>
                            <p className="text-sm font-semibold text-green-700">Strengths</p>
                            <p className="text-sm text-gray-600">{review.strengths}</p>
                          </div>
                        )}
                        {review.improvements && (
                          <div>
                            <p className="text-sm font-semibold text-orange-700">
                              Areas for Improvement
                            </p>
                            <p className="text-sm text-gray-600">{review.improvements}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
