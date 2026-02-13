import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Heart,
  MapPin,
  Briefcase,
} from "lucide-react";
import type {
  Staff,
  LeaveRequest,
  PayrollRecord,
  PerformanceReview,
  EmployeeBenefit,
} from "@shared/schema";

const API_BASE = "http://localhost:3000/api";

export default function HRManagement() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("employees");

  // Employee state
  const [employees, setEmployees] = useState<Staff[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Staff[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Leave state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All");

  // Payroll state
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [filteredPayroll, setFilteredPayroll] = useState<PayrollRecord[]>([]);

  // Performance state
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);

  // Benefits state
  const [benefits, setBenefits] = useState<EmployeeBenefit[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"employee" | "leave" | "payroll" | "review">("employee");

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Filter employees based on search
  useEffect(() => {
    const filtered = employees.filter((emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.email?.toLowerCase().includes(employeeSearch.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employeeSearch, employees]);

  // Filter leave requests based on status
  useEffect(() => {
    const filtered =
      leaveStatusFilter === "All"
        ? leaveRequests
        : leaveRequests.filter((lr) => lr.status === leaveStatusFilter);
    setFilteredLeaves(filtered);
  }, [leaveStatusFilter, leaveRequests]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load employees
      const empRes = await fetch(`${API_BASE}/staff`);
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
        setFilteredEmployees(empData);
      }

      // Load leave requests
      const leaveRes = await fetch(`${API_BASE}/leave-requests`);
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaveRequests(leaveData);
        setFilteredLeaves(leaveData);
      }

      // Load payroll records
      const payrollRes = await fetch(`${API_BASE}/payroll`);
      if (payrollRes.ok) {
        const payrollData = await payrollRes.json();
        setPayrollRecords(payrollData);
        setFilteredPayroll(payrollData);
      }

      // Load performance reviews
      const reviewRes = await fetch(`${API_BASE}/performance-reviews`);
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setPerformanceReviews(reviewData);
      }

      // Load benefits
      const benRes = await fetch(`${API_BASE}/benefits`);
      if (benRes.ok) {
        const benData = await benRes.json();
        setBenefits(benData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load HR data");
      console.error("Error loading HR data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const response = await fetch(`${API_BASE}/leave-requests/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          approvalDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (err) {
      console.error("Error approving leave:", err);
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      const response = await fetch(`${API_BASE}/leave-requests/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" }),
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (err) {
      console.error("Error rejecting leave:", err);
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`${API_BASE}/staff/${empId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadAllData();
        }
      } catch (err) {
        console.error("Error deleting employee:", err);
      }
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    if (confirm("Are you sure you want to delete this leave request?")) {
      try {
        const response = await fetch(`${API_BASE}/leave-requests/${leaveId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadAllData();
        }
      } catch (err) {
        console.error("Error deleting leave request:", err);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Loading HR data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR Management System</h1>
            <p className="text-gray-600 mt-2">
              Manage employees, leave, payroll, and performance
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.length}</div>
              <div className="text-xs text-gray-600 mt-2">
                {employees.filter((e) => e.status === "Active").length} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {leaveRequests.filter((l) => l.status === "Pending").length}
              </div>
              <div className="text-xs text-gray-600 mt-2">Awaiting approval</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {payrollRecords.filter((p) => p.paymentStatus === "Pending").length}
              </div>
              <div className="text-xs text-gray-600 mt-2">To be processed</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {benefits.filter((b) => b.status === "Active").length}
              </div>
              <div className="text-xs text-gray-600 mt-2">Currently active</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Benefits</span>
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search employees by name or email..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="max-w-md"
              />
              <Button
                onClick={() => {
                  setDialogType("employee");
                  setShowDialog(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Employee
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>
                  Showing {filteredEmployees.length} of {employees.length} employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-gray-500">
                              {employeeSearch
                                ? "No employees found"
                                : "No employees yet"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <TableRow key={emp.id}>
                            <TableCell className="font-medium">{emp.name}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {emp.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{emp.role}</Badge>
                            </TableCell>
                            <TableCell>{emp.department || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  emp.status === "Active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {emp.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp.hireDate
                                ? new Date(emp.hireDate).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setLocation(`/employee/${emp.id}`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEmployee(emp.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Tab */}
          <TabsContent value="leave" className="space-y-4">
            <div className="flex gap-4">
              <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Requests</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setDialogType("leave");
                  setShowDialog(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>
                  {filteredLeaves.filter((l) => l.status === "Pending").length}{" "}
                  pending approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeaves.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No leave requests
                    </p>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{leave.staffName}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {leave.leaveType} -{" "}
                            {leave.numberOfDays} days
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(leave.startDate).toLocaleDateString()} to{" "}
                            {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-4">
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
                        {leave.status === "Pending" && (
                          <div className="ml-4 space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApproveLeave(leave.id)
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleRejectLeave(leave.id)
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {leave.status !== "Pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteLeave(leave.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Button
              onClick={() => {
                setDialogType("payroll");
                setShowDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Payroll
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Records</CardTitle>
                <CardDescription>
                  {payrollRecords.filter((p) => p.paymentStatus === "Pending").length}{" "}
                  pending payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Employee</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead className="text-right">Gross Salary</TableHead>
                        <TableHead className="text-right">Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-gray-500">No payroll records</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        payrollRecords.map((payroll) => (
                          <TableRow key={payroll.id}>
                            <TableCell className="font-medium">
                              {payroll.staffName}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(payroll.payPeriodStart).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric", year: "numeric" }
                              )}{" "}
                              -{" "}
                              {new Date(payroll.payPeriodEnd).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric", year: "numeric" }
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${payroll.grossSalary}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              ${payroll.netSalary}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payroll.paymentStatus === "Pending"
                                    ? "outline"
                                    : "default"
                                }
                              >
                                {payroll.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setLocation(`/payroll/${payroll.id}`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Button
              onClick={() => {
                setDialogType("review");
                setShowDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Review
            </Button>

            <div className="grid md:grid-cols-2 gap-4">
              {performanceReviews.length === 0 ? (
                <Card className="col-span-2">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No performance reviews</p>
                  </CardContent>
                </Card>
              ) : (
                performanceReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="space-y-2">
                        <CardTitle className="text-lg">
                          {review.staffName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Rating: {review.overallRating}/5
                          </Badge>
                          <Badge variant={review.status === "Completed" ? "default" : "secondary"}>
                            {review.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600">Reviewer</p>
                        <p className="font-medium">{review.reviewerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Review Period</p>
                        <p className="font-medium">
                          {new Date(review.reviewPeriodStart).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          setLocation(`/performance-review/${review.id}`)
                        }
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <Button
              onClick={() => setShowDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Benefit
            </Button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.length === 0 ? (
                <Card className="col-span-3">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No benefits configured</p>
                  </CardContent>
                </Card>
              ) : (
                benefits.map((benefit) => (
                  <Card key={benefit.id}>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-base">
                          {benefit.benefitName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {benefit.staffName}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{benefit.benefitType}</Badge>
                        <Badge
                          variant={
                            benefit.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {benefit.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {benefit.provider && <p>Provider: {benefit.provider}</p>}
                        {benefit.coverage && <p>Coverage: {benefit.coverage}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new {dialogType}. This is a placeholder dialog - integrate with form data as needed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-600">
              Form for adding {dialogType} coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
