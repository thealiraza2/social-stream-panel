import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/useRateLimit";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: any;
}

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: any;
}

const statusColor: Record<string, string> = {
  open: "bg-warning/10 text-warning border-warning/20",
  answered: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const Tickets = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  // New ticket form
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Reply
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      let ticketList: Ticket[];
      try {
        const q = query(collection(db, "tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        ticketList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket));
      } catch {
        // Fallback if composite index not ready
        const q = query(collection(db, "tickets"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        ticketList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket));
        ticketList.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return bT - aT;
        });
      }
      setTickets(ticketList);
    } catch (err: any) {
      console.error("Tickets fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [user]);

  const fetchMessages = async (ticketId: string) => {
    setMsgLoading(true);
    try {
      let msgList: Message[];
      try {
        const q = query(collection(db, "ticket_messages"), where("ticketId", "==", ticketId), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        msgList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      } catch {
        const q = query(collection(db, "ticket_messages"), where("ticketId", "==", ticketId));
        const snap = await getDocs(q);
        msgList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
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

  const handleCreateTicket = async () => {
    if (!user || !newSubject.trim() || !newMessage.trim()) return;
    setCreating(true);
    try {
      const ticketRef = await addDoc(collection(db, "tickets"), {
        userId: user.uid,
        subject: newSubject.trim(),
        status: "open",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "ticket_messages"), {
        ticketId: ticketRef.id,
        senderId: user.uid,
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
      });
      toast({ title: "Ticket created!" });
      setNewSubject("");
      setNewMessage("");
      setDialogOpen(false);
      fetchTickets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async () => {
    if (!user || !selectedTicket || !reply.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "ticket_messages"), {
        ticketId: selectedTicket.id,
        senderId: user.uid,
        message: reply.trim(),
        createdAt: serverTimestamp(),
      });
      if (selectedTicket.status === "answered") {
        await updateDoc(doc(db, "tickets", selectedTicket.id), { status: "open" });
        setSelectedTicket(prev => prev ? { ...prev, status: "open" } : null);
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: "open" } : t));
      }
      setReply("");
      fetchMessages(selectedTicket.id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const openTicket = (t: Ticket) => {
    setSelectedTicket(t);
    fetchMessages(t.id);
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedTicket(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
              <Badge variant="outline" className={statusColor[selectedTicket.status] || ""}>{selectedTicket.status}</Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              {msgLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => {
                    const isMe = m.senderId === user?.uid;
                    const isAdmin = m.senderId === "admin";
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isMe ? "gradient-purple text-white" : "bg-secondary"}`}>
                          {isAdmin && <p className="text-[10px] font-medium mb-1 text-muted-foreground">Admin</p>}
                          <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>{formatDate(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            {selectedTicket.status !== "closed" && (
              <>
                <Separator />
                <div className="flex gap-2 p-3">
                  <Input placeholder="Type a message..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()} />
                  <Button onClick={handleReply} disabled={sending || !reply.trim()} size="icon" className="gradient-purple text-white border-0 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-purple text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Brief description of your issue" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Describe your issue in detail..." rows={4} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              </div>
              <Button onClick={handleCreateTicket} disabled={creating || !newSubject.trim() || !newMessage.trim()} className="w-full gradient-purple text-white border-0">
                {creating ? "Creating..." : "Submit Ticket"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-3" />
            <p>No tickets yet</p>
            <p className="text-xs">Create a new ticket to get support</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => openTicket(t)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusColor[t.status] || ""}>{t.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
