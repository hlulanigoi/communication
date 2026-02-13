import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Copy,
  Download,
  Download as DownloadIcon,
  Printer,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
// @ts-ignore - qrcode.react has incomplete types but provides its own declarations
import QRCode from "qrcode.react";
import { 
  getClients, 
  generateQRToken, 
  listQRTokens, 
  revokeQRToken, 
  deleteQRToken 
} from "@/lib/mobilePortalApi";
import type { Client, QRToken } from "@shared/schema";

interface TokenWithExpiry extends Omit<QRToken, 'createdAt' | 'expiresAt'> {
  createdAt: Date | null;
  expiresAt: Date | null;
  status: "active" | "expired" | "revoked";
  daysRemaining: number;
}

export default function QRManagement() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [tokens, setTokens] = useState<TokenWithExpiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [actionType, setActionType] = useState<"document" | "job">("document");
  const [expiresIn, setExpiresIn] = useState("30");
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [qrDisplayOpen, setQrDisplayOpen] = useState(false);

  // Load clients and tokens
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientList, tokenList] = await Promise.all([
          getClients(),
          listQRTokens(),
        ]);
        setClients(clientList);

        // Enhance tokens with status and days remaining
        const enhanced = tokenList.map((token: QRToken) => {
          const expiryDate = new Date(token.expiresAt || new Date());
          const now = new Date();
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          let status: "active" | "expired" | "revoked" = "active";
          if (token.revokedAt) status = "revoked";
          else if (daysRemaining < 0) status = "expired";

          return {
            ...token,
            status,
            daysRemaining,
          };
        });

        setTokens(enhanced);
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load QR tokens",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateQR = async () => {
    try {
      if (!selectedClient) {
        toast({
          title: "Missing Client",
          description: "Please select a client",
          variant: "destructive",
        });
        return;
      }

      setGenerating(true);

      const clientName = clients.find((c) => c.id === selectedClient)?.name || "";

      const payload = {
        clientId: selectedClient,
        clientName,
        actionType,
        expiresInDays: parseInt(expiresIn),
        createdBy: "admin", // In real app, get from auth context
      };

      const result = await generateQRToken(payload);
      setGeneratedToken(result);
      setQrDisplayOpen(true);

      // Add to tokens list
      const newToken: TokenWithExpiry = {
        ...result,
        status: "active",
        daysRemaining: parseInt(expiresIn),
      };
      setTokens([newToken, ...tokens]);

      toast({
        title: "Success",
        description: `QR code generated for ${clientName}`,
      });

      // Reset form
      setSelectedClient("");
      setActionType("document");
      setExpiresIn("30");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (generatedToken?.accessUrl) {
      navigator.clipboard.writeText(generatedToken.accessUrl);
      toast({
        title: "Copied",
        description: "Access URL copied to clipboard",
      });
    }
  };

  const handleDownloadQR = () => {
    const qrElement = document.getElementById("qr-code-display");
    if (qrElement) {
      const canvas = qrElement.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `qr-${generatedToken.clientId}-${generatedToken.actionType}.png`;
        link.click();
      }
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open("", "", "height=400,width=600");
    if (printWindow) {
      const qrElement = document.getElementById("qr-code-display");
      if (qrElement) {
        printWindow.document.write(qrElement.outerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this QR code?")) return;

    try {
      await revokeQRToken(tokenId);
      setTokens(
        tokens.map((t) =>
          t.id === tokenId ? { ...t, status: "revoked" as const } : t
        )
      );
      toast({
        title: "Revoked",
        description: "QR code has been revoked",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to revoke QR code",
        variant: "destructive",
      });
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm("Permanently delete this QR code?")) return;

    try {
      await deleteQRToken(tokenId);
      setTokens(tokens.filter((t) => t.id !== tokenId));
      toast({
        title: "Deleted",
        description: "QR code has been deleted",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">QR Code Management</h1>
          <p className="text-muted-foreground">Generate and manage QR codes for mobile portal access</p>
        </div>

        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Generate New QR Code
            </CardTitle>
            <CardDescription>Create a QR code for a client to access the mobile portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Client Select */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Client *</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Type */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Action Type *</label>
                <Select value={actionType} onValueChange={(val) => setActionType(val as "document" | "job")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document Capture</SelectItem>
                    <SelectItem value="job">Create Job</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiration */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Expires In *</label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">Never expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <div className="self-end">
                <Button
                  onClick={handleGenerateQR}
                  disabled={generating || !selectedClient}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Display Dialog */}
        {generatedToken && (
          <Dialog open={qrDisplayOpen} onOpenChange={setQrDisplayOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>QR Code Generated</DialogTitle>
                <DialogDescription>
                  {clients.find((c) => c.id === generatedToken.clientId)?.name} - {generatedToken.actionType}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* QR Code Display */}
                <div id="qr-code-display" className="flex justify-center p-4 bg-white rounded border">
                  <QRCode
                    value={generatedToken.accessUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Access URL */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Access URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedToken.accessUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      onClick={handleCopyUrl}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={handleDownloadQR}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handlePrintQR}
                    variant="outline"
                    size="sm"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    onClick={() => setQrDisplayOpen(false)}
                    size="sm"
                  >
                    Close
                  </Button>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Share this QR code with the client via SMS, email, or print it for physical display.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* QR Tokens Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active QR Codes</span>
              <Badge variant="outline">{tokens.filter((t) => t.status === "active").length} active</Badge>
            </CardTitle>
            <CardDescription>All generated QR codes and their usage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No QR codes yet. Generate one above to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow
                        key={token.id}
                        className={cn(
                          token.status === "revoked" && "opacity-50",
                          token.status === "expired" && "opacity-75"
                        )}
                      >
                        <TableCell className="font-medium">{token.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {token.actionType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : "-"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {token.daysRemaining > 0 ? `${token.daysRemaining}d left` : "Expired"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {token.lastUsedAt
                            ? new Date(token.lastUsedAt).toLocaleDateString()
                            : "Never"}
                          {token.usageCount && (
                            <br />
                          )}
                          {token.usageCount && (
                            <span className="text-xs text-muted-foreground">
                              ({token.usageCount} times)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              token.status === "active"
                                ? "default"
                                : token.status === "expired"
                                ? "secondary"
                                : "destructive"
                            }
                            className="capitalize"
                          >
                            {token.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>QR Code Preview</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center p-4 bg-white rounded border">
                                  <QRCode
                                    value={token.accessUrl || ""}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>

                            {token.status === "active" && (
                              <Button
                                onClick={() => handleRevokeToken(token.id)}
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-700"
                              >
                                Revoke
                              </Button>
                            )}

                            <Button
                              onClick={() => handleDeleteToken(token.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
