import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import type { VehicleProblem } from "@shared/schema";

export default function AdminProblems() {
  const [problems, setProblems] = useState<VehicleProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<VehicleProblem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partCategory: "",
    problemName: "",
    description: "",
    severity: "Moderate" as const,
    estimatedRepairCost: "",
    estimatedRepairTime: "",
  });

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    let filtered = problems;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.partCategory === selectedCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.problemName.toLowerCase().includes(lowerQuery) ||
          (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    }

    setFilteredProblems(filtered);
  }, [searchQuery, selectedCategory, problems]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/problems");
      if (response.ok) {
        const data = (await response.json()) || [];
        setProblems(data);

        const uniqueCategories = Array.from(
          new Set(data.map((p: VehicleProblem) => p.partCategory))
        ) as string[];
        setCategories(uniqueCategories.sort());
      }
    } catch (error) {
      console.error("Failed to load problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProblem = async () => {
    if (!formData.partCategory || !formData.problemName) {
      alert("Part category and problem name are required");
      return;
    }

    try {
      const url = editingId ? `/api/problems/${editingId}` : "/api/problems";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const saved = await response.json();
        if (editingId) {
          setProblems(problems.map((p) => (p.id === editingId ? saved : p)));
        } else {
          setProblems([...problems, saved]);
        }
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to save problem:", error);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProblems(problems.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete problem:", error);
    }
  };

  const startEdit = (problem: VehicleProblem) => {
    setEditingId(problem.id);
    setFormData({
      partCategory: problem.partCategory,
      problemName: problem.problemName,
      description: problem.description || "",
      severity: (problem.severity as any) || "Moderate",
      estimatedRepairCost: problem.estimatedRepairCost || "",
      estimatedRepairTime: problem.estimatedRepairTime || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      partCategory: "",
      problemName: "",
      description: "",
      severity: "Moderate",
      estimatedRepairCost: "",
      estimatedRepairTime: "",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Problem Library Management</h1>
          <p className="text-gray-600">
            Manage the vehicle problem library used for diagnostics
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by part..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Parts</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Problem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Problem" : "Add New Problem"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Part/Component *
                  </label>
                  <Input
                    placeholder="e.g., Engine, Transmission"
                    value={formData.partCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        partCategory: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Problem Name *
                  </label>
                  <Input
                    placeholder="e.g., Engine Knock"
                    value={formData.problemName}
                    onChange={(e) =>
                      setFormData({ ...formData, problemName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Detailed problem description"
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Severity
                  </label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Est. Repair Cost
                    </label>
                    <Input
                      placeholder="e.g., $200-500"
                      value={formData.estimatedRepairCost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedRepairCost: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Est. Repair Time
                    </label>
                    <Input
                      placeholder="e.g., 2-4 hours"
                      value={formData.estimatedRepairTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedRepairTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProblem} className="flex-1">
                    {editingId ? "Update" : "Add"} Problem
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Problems Table */}
        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No problems found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Part Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Problem Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Est. Cost
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Est. Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem) => (
                    <tr key={problem.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">{problem.partCategory}</td>
                      <td className="px-6 py-3 text-sm font-medium">
                        {problem.problemName}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Badge className={getSeverityColor(problem.severity)}>
                          {problem.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {problem.estimatedRepairCost || "-"}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {problem.estimatedRepairTime || "-"}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {problem.frequencyCount || "0"}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(problem)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProblem(problem.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-3xl font-bold">{problems.length}</div>
            <div className="text-gray-600 text-sm">Total Problems</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold">{categories.length}</div>
            <div className="text-gray-600 text-sm">Part Categories</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold">
              {problems.filter((p) => p.severity === "Critical").length}
            </div>
            <div className="text-gray-600 text-sm">Critical Issues</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold">
              {problems.reduce((sum, p) => sum + parseInt(p.frequencyCount || "0"), 0)}
            </div>
            <div className="text-gray-600 text-sm">Total Diagnoses</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
