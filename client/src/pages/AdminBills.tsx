import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, StickyNote, TrendingUp, AlertCircle as AlertIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getExpenses, getHRNotes, getPinnedHRNotes } from "@/lib/api";
import type { OperatingExpense, HRNote } from "@shared/schema";

export default function AdminBills() {
  const [expenses, setExpenses] = useState<OperatingExpense[]>([]);
  const [notes, setNotes] = useState<HRNote[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<HRNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expensesData, notesData, pinnedData] = await Promise.all([
          getExpenses(),
          getHRNotes(),
          getPinnedHRNotes()
        ]);
        setExpenses(expensesData);
        setNotes(notesData);
        setPinnedNotes(pinnedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground text-glow-red">Administration Hub</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">Managed by HR Manager</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-9 industrial-border bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Record New Bill
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Bills */}
        <Card className="lg:col-span-2 industrial-border">
          <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 font-black italic">
              <Receipt className="w-4 h-4 text-primary" />
              MONTHLY OPERATING EXPENSES
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-background">FEB 2024</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-border/50">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="h-6 bg-muted animate-pulse rounded w-64" />
                    <div className="h-6 bg-muted animate-pulse rounded w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="divide-y divide-border/50">
                  {expenses.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">No expenses recorded</div>
                  ) : (
                    expenses.map((exp) => (
                      <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-secondary flex items-center justify-center border-l-2 border-l-primary">
                            <Receipt className="w-5 h-5 opacity-50" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase tracking-tight">{exp.description}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{exp.id.slice(0, 8)} • {exp.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black font-display text-primary">${(exp.amount || 0).toFixed(2)}</p>
                          <Badge className={`text-[9px] font-black uppercase ${
                            exp.status === 'Paid' ? 'bg-emerald-500' : 'bg-primary'
                          }`}>
                            {exp.status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 bg-muted/20 border-t border-border/50 flex justify-between items-center">
                  <span className="font-black text-xs uppercase">Total Operating Costs</span>
                  <span className="text-2xl font-black font-display text-glow-red">${totalExpenses.toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* HR Manager Notes */}
        <div className="space-y-6">
          <Card className="industrial-border">
            <CardHeader className="bg-primary text-primary-foreground border-b border-primary-foreground/20">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                HR MANAGER NOTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="p-3 bg-muted animate-pulse rounded h-16" />
                ))
              ) : pinnedNotes.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-4">No pinned notes yet</div>
              ) : (
                pinnedNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-secondary/10 border-l-2 border-l-primary relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 -rotate-45 translate-x-4 -translate-y-4" />
                    <p className="text-xs font-bold leading-relaxed uppercase tracking-tight text-foreground/80">{note.content}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[9px] font-black text-primary italic uppercase">{note.author}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full border-dashed border-primary/30 text-[10px] font-black uppercase tracking-tighter hover:border-primary">
                Add New Note
              </Button>
            </CardContent>
          </Card>

          <Card className="industrial-border bg-black text-white">
            <CardHeader>
              <CardTitle className="text-xs font-black text-primary">SYSTEM ALERTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-8 bg-white/10 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex gap-3 items-start p-2 border border-white/10 bg-white/5">
                    <AlertIcon className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-[10px] font-bold uppercase leading-tight">{notes.length} HR notes recorded this month</p>
                  </div>
                  <div className="flex gap-3 items-start p-2 border border-white/10 bg-white/5">
                    <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-[10px] font-bold uppercase leading-tight">Total expenses: ${totalExpenses.toFixed(2)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
