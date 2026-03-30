import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw, Search, PackagePlus, Plus, Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const CACHE_KEY_PROVS = "cache_import_providers";
const CACHE_KEY_CATS = "cache_import_categories";
const CACHE_TTL = 5 * 60 * 1000;

interface ProviderService { service: number; name: string; rate: string; min: string; max: string; type?: string; category?: string; }
interface ImportRow { svc: ProviderService; selected: boolean; categoryId: string; marginType: "percent" | "fixed"; marginValue: string; added?: boolean; }

const getCache = (key: string) => {
  const cached = sessionStorage.getItem(key);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) return null;
  return data;
};
const setCache = (key: string, data: any) => sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));

const ImportServices = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [search, setSearch] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1");

  useEffect(() => {
    const load = async () => {
      const cachedProvs = getCache(CACHE_KEY_PROVS);
      const cachedCats = getCache(CACHE_KEY_CATS);
      if (cachedProvs && cachedCats) {
        setProviders(cachedProvs);
        setCategories(cachedCats);
        return;
      }
      try {
        const [pSnap, cSnap] = await Promise.all([
          getDocs(collection(db, "providers")),
          getDocs(collection(db, "categories")),
        ]);
        const provs = pSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((p: any) => p.status === "active");
        const cats = cSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((c: any) => c.status === "active");
        setProviders(provs);
        setCategories(cats);
        setCache(CACHE_KEY_PROVS, provs);
        setCache(CACHE_KEY_CATS, cats);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    load();
  }, []);

  const provider = providers.find(p => p.id === selectedProvider);

  const handleFetch = useCallback(async () => {
    if (!provider) return;
    setFetching(true);
    setRows([]);
    try {
      const res = await fetch('/api/fetch-services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiUrl: provider.apiUrl, apiKey: provider.apiKey }),
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) { if (data.error) throw new Error(data.error); throw new Error("Unexpected response format"); }
      setRows(data.map((svc: any) => ({ svc, selected: false, categoryId: "", marginType: "percent" as const, marginValue: "50" })));
      toast({ title: `${data.length} services fetched successfully!` });
    } catch (err: any) {
      console.error("Fetch Error:", err);
      toast({ title: "Fetch failed", description: err.message || "Failed to fetch data", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  }, [provider, toast]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => r.svc.name.toLowerCase().includes(q) || String(r.svc.service).includes(q));
  }, [rows, search]);

  const toggleRow = (idx: number) => {
    setRows(prev => { const next = [...prev]; const realIdx = rows.indexOf(filtered[idx]); next[realIdx] = { ...next[realIdx], selected: !next[realIdx].selected }; return next; });
  };
  const toggleAll = (checked: boolean) => {
    const filteredSet = new Set(filtered.map(r => r.svc.service));
    setRows(prev => prev.map(r => filteredSet.has(r.svc.service) ? { ...r, selected: checked } : r));
  };
  const updateRow = (filteredIdx: number, field: Partial<ImportRow>) => {
    setRows(prev => { const next = [...prev]; const realIdx = rows.indexOf(filtered[filteredIdx]); next[realIdx] = { ...next[realIdx], ...field }; return next; });
  };

  const rateMultiplier = parseFloat(exchangeRate) || 1;

  const getConvertedRate = useCallback((rate: string) => {
    return (parseFloat(rate) || 0) * rateMultiplier;
  }, [rateMultiplier]);

  const calcSelling = useCallback((row: ImportRow) => {
    const base = getConvertedRate(row.svc.rate);
    const margin = parseFloat(row.marginValue) || 0;
    if (row.marginType === "percent") return base + (base * margin) / 100;
    return base + margin;
  }, [getConvertedRate]);

  const selectedRows = useMemo(() => rows.filter(r => r.selected), [rows]);

  const handleAddSingle = useCallback(async (row: ImportRow, filteredIdx: number) => {
    if (!row.categoryId) { toast({ title: "Category required", description: "Please assign a category first.", variant: "destructive" }); return; }
    try {
      await addDoc(collection(db, "services"), {
        name: row.svc.name, categoryId: row.categoryId, rate: parseFloat(calcSelling(row).toFixed(4)),
        providerRate: parseFloat(row.svc.rate) || 0, minQuantity: parseInt(row.svc.min) || 0, maxQuantity: parseInt(row.svc.max) || 0,
        description: (row as any).svc?.description || "", providerId: selectedProvider,
        providerServiceId: row.svc.service, providerApiUrl: provider?.apiUrl || "", providerApiKey: provider?.apiKey || "",
        type: row.svc.type || "default", status: "active", marginType: row.marginType,
        marginValue: parseFloat(row.marginValue) || 0, createdAt: serverTimestamp(),
      });
      const realIdx = rows.indexOf(filtered[filteredIdx]);
      setRows(prev => { const next = [...prev]; next[realIdx] = { ...next[realIdx], added: true, selected: false }; return next; });
      sessionStorage.removeItem("cache_services_admin");
      sessionStorage.removeItem("cache_user_services");
      sessionStorage.removeItem("cache_neworder_services");
      toast({ title: "Service added!" });
    } catch (err: any) {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    }
  }, [selectedProvider, provider, rows, filtered, calcSelling, toast]);

  const handleImport = useCallback(async () => {
    const toImport = selectedRows.filter(r => r.categoryId);
    if (toImport.length === 0) { toast({ title: "No services ready", description: "Select services and assign categories first.", variant: "destructive" }); return; }
    setImporting(true);
    try {
      const batch = toImport.map(r =>
        addDoc(collection(db, "services"), {
          name: r.svc.name, categoryId: r.categoryId, rate: parseFloat(calcSelling(r).toFixed(4)),
          providerRate: parseFloat(r.svc.rate) || 0, minQuantity: parseInt(r.svc.min) || 0, maxQuantity: parseInt(r.svc.max) || 0,
          description: (r as any).svc?.description || "", providerId: selectedProvider,
          providerServiceId: r.svc.service, providerApiUrl: provider?.apiUrl || "", providerApiKey: provider?.apiKey || "",
          type: r.svc.type || "default", status: "active", marginType: r.marginType,
          marginValue: parseFloat(r.marginValue) || 0, createdAt: serverTimestamp(),
        })
      );
      await Promise.all(batch);
      toast({ title: `${toImport.length} services imported successfully!` });
      sessionStorage.removeItem("cache_services_admin");
      sessionStorage.removeItem("cache_user_services");
      sessionStorage.removeItem("cache_neworder_services");
      const importedIds = new Set(toImport.map(r => r.svc.service));
      setRows(prev => prev.map(r => importedIds.has(r.svc.service) ? { ...r, selected: false, added: true } : r));
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  }, [selectedRows, selectedProvider, provider, calcSelling, toast]);

  const bulkSetCategory = (catId: string) => {
    const selectedSet = new Set(selectedRows.map(r => r.svc.service));
    setRows(prev => prev.map(r => selectedSet.has(r.svc.service) ? { ...r, categoryId: catId } : r));
  };
  const bulkSetMargin = (type: "percent" | "fixed", value: string) => {
    const selectedSet = new Set(selectedRows.map(r => r.svc.service));
    setRows(prev => prev.map(r => selectedSet.has(r.svc.service) ? { ...r, marginType: type, marginValue: value } : r));
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(r => r.selected);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Import Services</h1>
        {selectedRows.length > 0 && <Badge variant="secondary" className="text-sm">{selectedRows.length} selected</Badge>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Select API Provider</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="sm:w-[300px]"><SelectValue placeholder="Choose a provider..." /></SelectTrigger>
              <SelectContent>{providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleFetch} disabled={!selectedProvider || fetching} className="gradient-purple text-white border-0">
              {fetching ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {fetching ? "Fetching..." : "Fetch Services"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedRows.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Bulk Actions ({selectedRows.length} selected)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs">Assign Category</Label>
                <Select onValueChange={bulkSetCategory}><SelectTrigger><SelectValue placeholder="Set category for all selected" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-[140px]">
                <Label className="text-xs">Margin Type</Label>
                <Select onValueChange={(v) => bulkSetMargin(v as any, selectedRows[0]?.marginValue || "50")}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">Percentage %</SelectItem><SelectItem value="fixed">Fixed $</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-[100px]">
                <Label className="text-xs">Margin</Label>
                <Input type="number" placeholder="50" onChange={e => {
                  const v = e.target.value;
                  const selectedSet = new Set(selectedRows.map(r => r.svc.service));
                  setRows(prev => prev.map(r => selectedSet.has(r.svc.service) ? { ...r, marginValue: v } : r));
                }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <CardTitle className="text-base">{rows.length} Services Available</CardTitle>
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"><Checkbox checked={allFilteredSelected} onCheckedChange={(c) => toggleAll(!!c)} /></TableHead>
                    <TableHead className="w-[70px]">ID</TableHead><TableHead>Name</TableHead><TableHead className="w-[90px]">Rate/1k</TableHead>
                    <TableHead className="w-[70px]">Min</TableHead><TableHead className="w-[70px]">Max</TableHead>
                    <TableHead className="w-[180px]">Category</TableHead><TableHead className="w-[120px]">Margin</TableHead>
                    <TableHead className="w-[100px]">Selling</TableHead><TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, idx) => (
                    <TableRow key={row.svc.service} className={row.selected ? "bg-primary/5" : ""}>
                      <TableCell><Checkbox checked={row.selected} onCheckedChange={() => toggleRow(idx)} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.svc.service}</TableCell>
                      <TableCell className="text-sm font-medium max-w-[250px] truncate">{row.svc.name}</TableCell>
                      <TableCell className="text-sm">Rs.{row.svc.rate}</TableCell>
                      <TableCell className="text-sm">{parseInt(row.svc.min).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{parseInt(row.svc.max).toLocaleString()}</TableCell>
                      <TableCell>
                        <Select value={row.categoryId} onValueChange={v => updateRow(idx, { categoryId: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 items-center">
                          <Select value={row.marginType} onValueChange={v => updateRow(idx, { marginType: v as any })}>
                            <SelectTrigger className="h-8 w-[50px] text-xs px-1"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">$</SelectItem></SelectContent>
                          </Select>
                          <Input type="number" value={row.marginValue} onChange={e => updateRow(idx, { marginValue: e.target.value })} className="h-8 w-[60px] text-xs" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-primary">Rs.{calcSelling(row).toFixed(2)}</TableCell>
                      <TableCell>
                        {row.added ? (
                          <Badge variant="outline" className="text-green-600 border-green-600"><Check className="h-3 w-3 mr-1" /> Added</Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={!row.categoryId} onClick={() => handleAddSingle(row, idx)}>
                            <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">{search ? "No matching services" : "No services fetched"}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <div className="flex justify-end sticky bottom-4">
          <Button size="lg" onClick={handleImport} disabled={importing || selectedRows.length === 0} className="gradient-purple text-white border-0 px-8 shadow-lg">
            {importing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
            {importing ? "Importing..." : `Import ${selectedRows.filter(r => r.categoryId).length} Selected`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImportServices;
