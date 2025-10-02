import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Check, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export const AllTransactionsTab = ({ transactions, loading, handleDelete, getCategoryColor, navigate }: any) => (
  <>
    {loading ? (
      <div className="text-center text-muted-foreground py-8">
        <div className="inline-block animate-pulse-glow">Loading transactions...</div>
      </div>
    ) : transactions.length === 0 ? (
      <div className="text-center py-12 animate-scale-in">
        <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
        <p className="text-muted-foreground mb-4">No transactions yet</p>
        <Button onClick={() => navigate("/upload")} className="hover-lift">
          Upload Your First Receipt
        </Button>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs md:text-sm">Date</TableHead>
              <TableHead className="text-xs md:text-sm">Description</TableHead>
              <TableHead className="text-xs md:text-sm hidden sm:table-cell">Vendor</TableHead>
              <TableHead className="text-xs md:text-sm hidden md:table-cell">Category</TableHead>
              <TableHead className="text-xs md:text-sm">Amount</TableHead>
              <TableHead className="text-xs md:text-sm text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction: any) => (
              <TableRow key={transaction.id} className="hover:bg-secondary/50 transition-colors">
                <TableCell className="text-xs md:text-sm">
                  {format(new Date(transaction.date), "MMM dd")}
                </TableCell>
                <TableCell className="font-medium text-xs md:text-sm">
                  {transaction.description}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs md:text-sm">{transaction.vendor || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={`${getCategoryColor(transaction.category)} text-xs`}>
                    {transaction.category.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-accent text-xs md:text-sm">
                  ${Number(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="hover-lift h-8 w-8 md:h-9 md:w-9">
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                      className="hover-lift h-8 w-8 md:h-9 md:w-9"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </>
);

export const NeedsReviewTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Needs Review</CardTitle>
      <CardDescription>Transactions requiring manual verification or category assignment</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 border border-warning/30 rounded-lg bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Office Depot - $450.00</p>
                  <p className="text-sm text-muted-foreground">Dec 15, 2024</p>
                  <p className="text-sm mt-1">AI Category: <span className="text-primary">Office Supplies</span> (Confidence: 65%)</p>
                  <p className="text-xs text-muted-foreground mt-1">Why: Amount significantly higher than usual for this category</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="hover:bg-success/10 hover:text-success">
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4 mr-1" /> Reassign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          <strong>TODO:</strong> Load actual transactions with confidence &lt; 0.7 from database
        </p>
      </div>
    </CardContent>
  </Card>
);

export const ReconcileTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Reconciliation</CardTitle>
      <CardDescription>Match bank transactions with receipts and invoices</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>TODO:</strong> Reconciliation interface with:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Left panel: Unmatched bank transactions</li>
            <li>Right panel: Proposed matches from receipts</li>
            <li>Match scoring (date ±3d, amount ≤1%, vendor similarity)</li>
            <li>Actions: Match, Ignore, Adjust</li>
            <li>Auto-match button for confidence ≥85%</li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const VendorsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Vendors</CardTitle>
      <CardDescription>Manage normalized vendor names and categories</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raw Name</TableHead>
                <TableHead>Normalized Name</TableHead>
                <TableHead>Default Category</TableHead>
                <TableHead>Transactions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs">UBER *TRIP</TableCell>
                <TableCell className="font-medium">Uber</TableCell>
                <TableCell><Badge>Transportation</Badge></TableCell>
                <TableCell>15</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs">AMZN MKTP US</TableCell>
                <TableCell className="font-medium">Amazon</TableCell>
                <TableCell><Badge>Office Supplies</Badge></TableCell>
                <TableCell>8</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground text-center pt-4">
          <strong>TODO:</strong> Load from vendors table with manual override capability
        </p>
      </div>
    </CardContent>
  </Card>
);
