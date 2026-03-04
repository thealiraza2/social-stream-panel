import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from "firebase/firestore";
import { TableSkeleton } from "@/components/TableSkeleton";

const PAGE_SIZE = 25;

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(data);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
      const snap = await getDocs(collection(db, "transactions"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => {
        const aT = a.createdAt?.toDate?.()?.getTime() || 0;
        const bT = b.createdAt?.toDate?.()?.getTime() || 0;
        return bT - aT;
      });
      setTransactions(data);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(prev => [...prev, ...data]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc]);

  useEffect(() => { fetchFirstPage(); }, [fetchFirstPage]);

  const filtered = useMemo(() => transactions.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.userId?.includes(search);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  }), [transactions, search, typeFilter]);

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
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableSkeleton rows={5} cols={7} /> : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>No transactions found</p>
                    </div>
                  </TableCell></TableRow>
                ) : filtered.map(t => (
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
        </CardContent>
      </Card>
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={fetchNextPage} disabled={loadingMore}>
            {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : "Load More"}
          </Button>
        </div>
      )}
      {!hasMore && transactions.length > 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground">All records loaded ({transactions.length} total)</p>
      )}
    </div>
  );
};

export default TransactionLogs;
