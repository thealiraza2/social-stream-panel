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
import { MessageSquare, Send, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, doc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  open: "bg-warning/10 text-warning border-warning/20",
  answered: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const TicketManagement = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let ticketList: any[];
      try {
        const snap = await getDocs(query(collection(db, "tickets"), orderBy("createdAt", "desc")));
        ticketList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const snap = await getDocs(collection(db, "tickets"));
        ticketList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ticketList.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return bT - aT;
        });
      }
      setTickets(ticketList);

      // Fetch user details for display
      const userIds = [...new Set(ticketList.map(t => t.userId).filter(Boolean))];
      const userMap: Record<string, any> = {};
      await Promise.all(userIds.map(async (uid) => {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) userMap[uid] = userDoc.data();
        } catch {}
      }));
      setUsers(userMap);
    } catch (err: any) {
      console.error("Tickets fetch error:", err);
      toast({ title: "Error loading tickets", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const openTicket = async (t: any) => {
    setSelectedTicket(t);
    setMsgLoading(true);
    try {
      let msgList: any[];
      try {
        const q = query(collection(db, "ticket_messages"), where("ticketId", "==", t.id), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        msgList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const q = query(collection(db, "ticket_messages"), where("ticketId", "==", t.id));
        const snap = await getDocs(q);
        msgList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        msgList.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return aT - bT;
        });
      }
      setMessages(msgList);
    } catch (err: any) {
      console.error("Messages fetch error:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await addDoc(collection(db, "ticket_messages"), {
        ticketId: selectedTicket.id,
        senderId: "admin",
        message: reply.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "tickets", selectedTicket.id), { status: "answered" });
      setReply("");
      // Refresh messages
      openTicket({ ...selectedTicket, status: "answered" });
      // Update local ticket status
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: "answered" } : t));
      toast({ title: "Reply sent" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTicket?.id === id) setSelectedTicket((prev: any) => prev ? { ...prev, status } : null);
      toast({ title: `Ticket ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getUserDisplay = (userId: string) => {
    const u = users[userId];
    if (u) return u.email || u.displayName || userId.slice(0, 10);
    return userId?.slice(0, 10) || "—";
  };

  const filtered = tickets.filter(t => statusFilter === "all" || t.status === statusFilter);
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ticket Management</h1>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>
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
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => openTicket(t)}>{t.subject}</TableCell>
                    <TableCell className="text-xs">{getUserDisplay(t.userId)}</TableCell>
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
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      No tickets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-4">
              <span>{selectedTicket?.subject}</span>
              <Badge variant="outline" className={statusColors[selectedTicket?.status] || ""}>{selectedTicket?.status}</Badge>
            </DialogTitle>
            <p className="text-xs text-muted-foreground">From: {selectedTicket && getUserDisplay(selectedTicket.userId)}</p>
          </DialogHeader>
          <ScrollArea className="h-[350px] pr-3">
            {msgLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages</p>
            ) : (
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.senderId === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${m.senderId === "admin" ? "gradient-purple text-white" : "bg-secondary"}`}>
                      <p className="text-[10px] font-medium mb-1 ${m.senderId === 'admin' ? 'text-white/70' : 'text-muted-foreground'}">
                        {m.senderId === "admin" ? "Admin" : getUserDisplay(selectedTicket?.userId)}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.senderId === "admin" ? "text-white/60" : "text-muted-foreground"}`}>{formatDate(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {selectedTicket?.status !== "closed" && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Input
                  placeholder="Type reply..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                />
                <Button onClick={handleReply} disabled={sending || !reply.trim()} size="icon" className="gradient-purple text-white border-0 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketManagement;
