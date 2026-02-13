import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
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
import { Plus, Search, X, AlertCircle } from "lucide-react";
import type { VehicleProblem, VehicleDiagnostic } from "@shared/schema";

interface DiagnosticFinderPageParams {
  vehicleId: string;
  inspectionId: string;
}

export default function DiagnosticFinder() {
  const { vehicleId, inspectionId } = useParams<DiagnosticFinderPageParams>();

  // State for problem library browsing
  const [problems, setProblems] = useState<VehicleProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<VehicleProblem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // State for current diagnostics on this inspection
  const [currentDiagnostics, setCurrentDiagnostics] = useState<VehicleDiagnostic[]>([]);

  // State for manual problem entry
  const [showNewProblemForm, setShowNewProblemForm] = useState(false);
  const [newProblemName, setNewProblemName] = useState("");
  const [newProblemCategory, setNewProblemCategory] = useState("");
  const [newProblemSeverity, setNewProblemSeverity] = useState("Moderate");
  const [newProblemDescription, setNewProblemDescription] = useState("");

  // Load problems from library
  useEffect(() => {
    if (vehicleId && inspectionId) {
      loadProblems();
      loadCurrentDiagnostics();
    }
  }, [inspectionId, vehicleId]);

  // Filter problems when search or category changes
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
          (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
          p.partCategory.toLowerCase().includes(lowerQuery)
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

        // Extract unique categories
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

  const loadCurrentDiagnostics = async () => {
    try {
      const response = await fetch(
        `/api/diagnostics/inspection/${inspectionId}`
      );
      if (response.ok) {
        const data = (await response.json()) || [];
        setCurrentDiagnostics(data);
      }
    } catch (error) {
      console.error("Failed to load diagnostics:", error);
    }
  };

  const recordDiagnostic = async (
    problemId: string | undefined,
    problemName: string,
    partCategory: string,
    severity: string = "Moderate"
  ) => {
    try {
      const response = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleInspectionId: inspectionId,
          vehicleId,
          problemId,
          problemName,
          partCategory,
          severity,
          status: "Identified",
          diagnosedByName: "Receptionist",
        }),
      });

      if (response.ok) {
        const diagnostic = await response.json();
        setCurrentDiagnostics([...currentDiagnostics, diagnostic]);
      }
    } catch (error) {
      console.error("Failed to record diagnostic:", error);
    }
  };

  const createNewProblem = async () => {
    if (!newProblemName || !newProblemCategory) {
      alert("Please fill in problem name and category");
      return;
    }

    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partCategory: newProblemCategory,
          problemName: newProblemName,
          description: newProblemDescription,
          severity: newProblemSeverity,
          createdBy: "Receptionist",
        }),
      });

      if (response.ok) {
        const newProblem = await response.json();

        // Add to library
        setProblems([...problems, newProblem]);

        // Immediately record as diagnostic
        await recordDiagnostic(
          newProblem.id,
          newProblem.problemName,
          newProblem.partCategory,
          newProblem.severity
        );

        // Reset form
        setNewProblemName("");
        setNewProblemCategory("");
        setNewProblemDescription("");
        setNewProblemSeverity("Moderate");
        setShowNewProblemForm(false);
      }
    } catch (error) {
      console.error("Failed to create problem:", error);
    }
  };

  const removeDiagnostic = async (diagnosticId: string) => {
    try {
      const response = await fetch(`/api/diagnostics/${diagnosticId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCurrentDiagnostics(
          currentDiagnostics.filter((d) => d.id !== diagnosticId)
        );
      }
    } catch (error) {
      console.error("Failed to remove diagnostic:", error);
    }
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
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Vehicle Diagnostics</h1>
        <p className="text-gray-600 text-sm">
          Vehicle ID: {vehicleId} | Inspection ID: {inspectionId}
        </p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">Problem Library</TabsTrigger>
          <TabsTrigger value="findings">
            Findings ({currentDiagnostics.length})
          </TabsTrigger>
        </TabsList>

        {/* Problem Library Tab */}
        <TabsContent value="library" className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
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
          </div>

          {/* Manual Problem Entry Button */}
          <Dialog open={showNewProblemForm} onOpenChange={setShowNewProblemForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mb-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Problem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Problem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Problem Name *
                  </label>
                  <Input
                    placeholder="e.g., Engine Knock"
                    value={newProblemName}
                    onChange={(e) => setNewProblemName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Part/Component *
                  </label>
                  <Input
                    placeholder="e.g., Engine, Transmission"
                    value={newProblemCategory}
                    onChange={(e) => setNewProblemCategory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Severity
                  </label>
                  <Select value={newProblemSeverity} onValueChange={setNewProblemSeverity}>
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Details about the problem"
                    value={newProblemDescription}
                    onChange={(e) => setNewProblemDescription(e.target.value)}
                  />
                </div>
                <Button onClick={createNewProblem} className="w-full">
                  Save & Record Problem
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Problems Grid */}
          {loading ? (
            <div className="text-center py-8">Loading problems...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No problems found. Try a different search or add a custom problem.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProblems.map((problem) => (
                <Card
                  key={problem.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    recordDiagnostic(
                      problem.id,
                      problem.problemName,
                      problem.partCategory,
                      problem.severity
                    )
                  }
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{problem.problemName}</h3>
                      <p className="text-xs text-gray-500">{problem.partCategory}</p>
                      {problem.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {problem.description}
                        </p>
                      )}
                    </div>
                    <Badge className={getSeverityColor(problem.severity)}>
                      {problem.severity}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-3">
          {currentDiagnostics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              No findings recorded yet. Select problems from the library above.
            </div>
          ) : (
            <div className="space-y-2">
              {currentDiagnostics.map((diagnostic) => (
                <Card key={diagnostic.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{diagnostic.problemName}</h3>
                        <Badge className={getSeverityColor(diagnostic.severity)}>
                          {diagnostic.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {diagnostic.partCategory}
                      </p>
                      {diagnostic.notes && (
                        <p className="text-sm text-gray-700 mt-2">{diagnostic.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Status: {diagnostic.status}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiagnostic(diagnostic.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
