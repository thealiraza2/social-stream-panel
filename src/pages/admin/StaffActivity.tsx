import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const StaffActivity = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(query(collection(db, "staff_activity"), orderBy("createdAt", "desc")));
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetch();
  }, []);

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Activity</h1>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No staff activity logged</p>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Action</TableHead><TableHead>Details</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.staffName || l.staffId}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{l.details}</TableCell>
                  <TableCell className="text-xs">{formatDate(l.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
};
export default StaffActivity;
