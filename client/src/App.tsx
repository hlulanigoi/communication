import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import VehicleList from "@/pages/VehicleList";
import JobBoard from "@/pages/JobBoard";
import Inventory from "@/pages/Inventory";
import ClientDirectory from "@/pages/ClientDirectory";
import Billing from "@/pages/Billing";
import Communication from "@/pages/Communication";
import Analytics from "@/pages/Analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vehicles" component={VehicleList} />
      <Route path="/jobs" component={JobBoard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/clients" component={ClientDirectory} />
      <Route path="/billing" component={Billing} />
      <Route path="/communication" component={Communication} />
      <Route path="/analytics" component={Analytics} />
      
      {/* Fallback routes for demos */}
      <Route path="/schedule" component={Dashboard} />
      <Route path="/documents" component={Dashboard} />
      <Route path="/admin" component={Dashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
