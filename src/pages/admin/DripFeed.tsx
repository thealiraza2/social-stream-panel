import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Repeat } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const DripFeed = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allOrders: any[];
        try {
          const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
          allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          const snap = await getDocs(collection(db, "orders"));
          allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          allOrders.sort((a, b) => {
            const aT = a.createdAt?.toDate?.()?.getTime() || 0;
            const bT = b.createdAt?.toDate?.()?.getTime() || 0;
            return bT - aT;
          });
        }
        setOrders(allOrders.filter((o: any) => o.dripFeed));
      } catch (err) {
        console.error("DripFeed fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Drip-feed Orders</h1>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Repeat className="h-8 w-8 mb-2" />
              <p>No drip-feed orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Qty</TableHead><TableHead>Charge</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>{o.serviceName}</TableCell>
                    <TableCell>{o.quantity?.toLocaleString()}</TableCell>
                    <TableCell>Rs.{o.charge?.toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(o.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default DripFeed;
