import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  open: "text-yellow-600", answered: "text-green-600", closed: "text-muted-foreground",
};

const TicketManagement = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTickets = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "tickets"), orderBy("createdAt", "desc")));
    setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const openTicket = async (t: any) => {
    setSelectedTicket(t);
    const q = query(collection(db, "ticket_messages"), where("ticketId", "==", t.id), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await addDoc(collection(db, "ticket_messages"), {
        ticketId: selectedTicket.id, senderId: "admin", message: reply.trim(), createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "tickets", selectedTicket.id), { status: "answered" });
      setReply("");
      openTicket(selectedTicket);
      toast({ title: "Reply sent" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "tickets", id), { status });
    fetchTickets();
  };

  const filtered = tickets.filter(t => statusFilter === "all" || t.status === statusFilter);
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ticket Management</h1>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="answered">Answered</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Subject</TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => openTicket(t)}>{t.subject}</TableCell>
                    <TableCell className="text-xs font-mono">{t.userId?.slice(0, 10)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[t.status] || ""}>{t.status}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(t.createdAt)}</TableCell>
                    <TableCell>
                      <Select value={t.status} onValueChange={v => updateTicketStatus(t.id, v)}>
                        <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No tickets</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedTicket?.subject}</DialogTitle></DialogHeader>
          <ScrollArea className="h-[350px] pr-3">
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${m.senderId === "admin" ? "gradient-purple text-white" : "bg-secondary"}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                    <p className={`text-[10px] mt-1 ${m.senderId === "admin" ? "text-white/60" : "text-muted-foreground"}`}>{formatDate(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="flex gap-2">
            <Input placeholder="Type reply..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReply()} />
            <Button onClick={handleReply} disabled={sending || !reply.trim()} size="icon" className="gradient-purple text-white border-0 shrink-0"><Send className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketManagement;
