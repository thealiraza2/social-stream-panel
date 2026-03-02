import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw, Search, PackagePlus } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const ImportServices = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const [pSnap, cSnap] = await Promise.all([
        getDocs(collection(db, "providers")),
        getDocs(collection(db, "categories")),
      ]);
      setProviders(pSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((p: any) => p.status === "active"));
      setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((c: any) => c.status === "active"));
    };
    load();
  }, []);

  const provider = providers.find(p => p.id === selectedProvider);

  // 🔴 YAHAN DEKHEIN: Proxy URL bilkul fix hai
  const handleFetch = async () => {
    if (!provider) return;
    setFetching(true);
    setRows([]);
    
    try {
      console.log("Fetching via Proxy for Provider:", provider.name);
      
      const res = await fetch('https://my-server-one-lake.vercel.app/api/proxy-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiUrl: provider.apiUrl, 
          apiKey: provider.apiKey 
        }),
      });

      if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);
      
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data.error || "Invalid Response");
      
      setRows(data.map((svc: any) => ({
          svc,
          selected: false,
          categoryId: "",
          marginType: "percent",
          marginValue: "50",
      })));
      toast({ title: "Services loaded successfully!" });
    } catch (err: any) {
      toast({ title: "Fetch failed", description: err.message, variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  // UI Code starts here...
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => r.svc.name.toLowerCase().includes(q) || String(r.svc.service).includes(q));
  }, [rows, search]);

  const toggleRow = (idx: number) => {
    setRows(prev => {
      const next = [...prev];
      const realIdx = rows.indexOf(filtered[idx]);
      next[realIdx] = { ...next[realIdx], selected: !next[realIdx].selected };
      return next;
    });
  };

  const updateRow = (filteredIdx: number, field: any) => {
    setRows(prev => {
      const next = [...prev];
      const realIdx = rows.indexOf(filtered[filteredIdx]);
      next[realIdx] = { ...next[realIdx], ...field };
      return next;
    });
  };

  const calcSelling = (row: any) => {
    const base = parseFloat(row.svc.rate) || 0;
    const margin = parseFloat(row.marginValue) || 0;
    return row.marginType === "percent" ? base + (base * margin) / 100 : base + margin;
  };

  const handleImport = async () => {
    const toImport = rows.filter(r => r.selected && r.categoryId);
    setImporting(true);
    try {
      const batch = toImport.map(r =>
        addDoc(collection(db, "services"), {
          name: r.svc.name,
          categoryId: r.categoryId,
          rate: parseFloat(calcSelling(r).toFixed(4)),
          providerRate: parseFloat(r.svc.rate) || 0,
          minQuantity: parseInt(r.svc.min) || 0,
          maxQuantity: parseInt(r.svc.max) || 0,
          providerId: selectedProvider,
          providerServiceId: r.svc.service,
          status: "active",
          createdAt: serverTimestamp(),
        })
      );
      await Promise.all(batch);
      toast({ title: "Import successful!" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Import Services</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Choose Provider" /></SelectTrigger>
              <SelectContent>
                {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleFetch} disabled={fetching}>
              {fetching ? <RefreshCw className="animate-spin mr-2" /> : <Download className="mr-2" />}
              Fetch Services
            </Button>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{rows.length} Services Found</CardTitle>
            <Input className="w-64" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Rate/1k</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Selling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, idx) => (
                    <TableRow key={row.svc.service}>
                      <TableCell><Checkbox checked={row.selected} onCheckedChange={() => toggleRow(idx)} /></TableCell>
                      <TableCell>{row.svc.service}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{row.svc.name}</TableCell>
                      <TableCell>${row.svc.rate}</TableCell>
                      <TableCell>
                        <Select value={row.categoryId} onValueChange={v => updateRow(idx, { categoryId: v })}>
                          <SelectTrigger className="w-32"><SelectValue placeholder="Set Category" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-bold">${calcSelling(row).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleImport} disabled={importing}>Import Selected</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportServices;
