import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let txList: any[];
        try {
          const snap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc")));
          txList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          const snap = await getDocs(collection(db, "transactions"));
          txList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          txList.sort((a, b) => {
            const aT = a.createdAt?.toDate?.()?.getTime() || 0;
            const bT = b.createdAt?.toDate?.()?.getTime() || 0;
            return bT - aT;
          });
        }
        setTransactions(txList);
      } catch (err) {
        console.error("Transaction fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.userId?.includes(search);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction Logs</h1>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="spend">Spend</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <FileText className="h-8 w-8 mb-2" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.userId?.slice(0, 10)}</TableCell>
                      <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                      <TableCell className="font-medium">Rs.{t.amount?.toFixed(2)}</TableCell>
                      <TableCell>{t.paymentMethod}</TableCell>
                      <TableCell><Badge variant="outline" className={t.status === "completed" ? "text-green-600" : t.status === "pending" ? "text-yellow-600" : "text-red-600"}>{t.status}</Badge></TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{t.description}</TableCell>
                      <TableCell className="text-xs">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionLogs;
