import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  Receipt 
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { format } from "date-fns";

const Ledger = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadTransactions(session.user.id);
      }
    });
  }, [navigate]);

  const loadTransactions = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Failed to load transactions");
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete transaction");
    } else {
      toast.success("Transaction deleted");
      loadTransactions(user.id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food_dining: "bg-orange-500",
      transportation: "bg-blue-500",
      utilities: "bg-yellow-500",
      rent_mortgage: "bg-purple-500",
      office_supplies: "bg-green-500",
      equipment: "bg-red-500",
      services: "bg-indigo-500",
      travel: "bg-pink-500",
      entertainment: "bg-cyan-500",
      healthcare: "bg-teal-500",
      insurance: "bg-amber-500",
      taxes: "bg-rose-500",
      other: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary neon-glow">Transaction Ledger</h1>
            <p className="text-sm md:text-base text-muted-foreground">View and manage all your transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/upload")} className="hover-lift text-sm md:text-base flex-1 md:flex-none">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button variant="outline" className="hover-lift text-sm md:text-base flex-1 md:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card className="stat-card neon-border animate-fade-up">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="inline-block animate-pulse-glow">Loading transactions...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 animate-scale-in">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                <Button onClick={() => navigate("/upload")} className="hover-lift">
                  <Plus className="mr-2 h-4 w-4" />
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
                  {transactions.map((transaction) => (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover-lift h-8 w-8 md:h-9 md:w-9"
                          >
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Ledger;