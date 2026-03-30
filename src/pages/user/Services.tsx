import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Search, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { TableSkeleton } from "@/components/TableSkeleton";

const PAGE_SIZE = 50;

const CACHE_KEY_SVC = "cache_user_services";
const CACHE_KEY_CAT = "cache_user_categories";
const CACHE_TTL = 2 * 60 * 1000;

interface Category { id: string; name: string; sortOrder: number; status: string; }
interface Service { id: string; name: string; categoryId: string; rate: number; minQuantity: number; maxQuantity: number; description: string; status: string; }

const getCache = (key: string) => {
  const cached = sessionStorage.getItem(key);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) return null;
  return data;
};
const setCache = (key: string, data: any) => sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));

const Services = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const cachedSvc = getCache(CACHE_KEY_SVC);
      const cachedCat = getCache(CACHE_KEY_CAT);
      if (cachedSvc && cachedCat) {
        setServices(cachedSvc);
        setCategories(cachedCat);
        setLoading(false);
        return;
      }

      const [catSnap, svcSnap] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "services")),
      ]);
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category)).filter(c => c.status === "active").sort((a, b) => a.sortOrder - b.sortOrder);
      const svcs = svcSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)).filter(s => s.status === "active");
      setCategories(cats);
      setServices(svcs);
      setCache(CACHE_KEY_SVC, svcs);
      setCache(CACHE_KEY_CAT, cats);
      setLoading(false);
    };
    fetchData();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    services.forEach(s => { counts[s.categoryId] = (counts[s.categoryId] || 0) + 1; });
    return counts;
  }, [services]);

  const filtered = useMemo(() => services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || s.categoryId === categoryFilter;
    return matchSearch && matchCategory;
  }), [services, search, categoryFilter]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name ?? "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Services
            <Badge variant="secondary" className="text-xs">{services.length} total</Badge>
          </h1>
          <p className="text-muted-foreground">Browse available social media services</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories ({services.length})</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name} ({categoryCounts[c.id] || 0})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Rate / 1K</TableHead><TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>Description</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody><TableSkeleton rows={5} cols={8} /></TableBody>
              </Table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Server className="h-10 w-10 mb-3" />
              <p>No services available</p>
            </div>
          ) : (
            <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Rate / 1K</TableHead><TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>Description</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell><Badge variant="outline">{getCategoryName(s.categoryId)}</Badge></TableCell>
                      <TableCell className="font-semibold text-primary">Rs.{s.rate}</TableCell>
                      <TableCell>{s.minQuantity?.toLocaleString()}</TableCell>
                      <TableCell>{s.maxQuantity?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{s.description}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => navigate(`/new-order?service=${s.id}`)}>
                          <ShoppingCart className="h-3 w-3" /> Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {paginated.map((s) => (
                <div key={s.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm leading-tight">{s.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{getCategoryName(s.categoryId)}</Badge>
                    </div>
                    <span className="font-semibold text-primary text-sm whitespace-nowrap">Rs.{s.rate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Min: {s.minQuantity?.toLocaleString()} — Max: {s.maxQuantity?.toLocaleString()}</span>
                    <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => navigate(`/new-order?service=${s.id}`)}>
                      <ShoppingCart className="h-3 w-3" /> Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-sm text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
