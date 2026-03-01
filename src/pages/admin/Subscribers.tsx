import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const Subscribers = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "subscribers"));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetch();
  }, []);

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString() : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscribers</h1>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No subscribers yet</p>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Subscribed</TableHead></TableRow></TableHeader>
            <TableBody>{items.map(i => (<TableRow key={i.id}><TableCell>{i.email}</TableCell><TableCell className="text-xs">{formatDate(i.createdAt)}</TableCell></TableRow>))}</TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
};
export default Subscribers;
