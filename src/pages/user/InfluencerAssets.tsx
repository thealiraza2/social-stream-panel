import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Image, FileText, Palette, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const categoryIcons: Record<string, any> = {
  banner: Image,
  video_script: FileText,
  logo: Palette,
  feature_highlight: Sparkles,
};

const InfluencerAssets = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, "marketing_assets"));
        setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const categories = ["all", "banner", "video_script", "logo", "feature_highlight"];

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Marketing Assets</h1>
        <p className="text-muted-foreground">Download promotional materials for your campaigns</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map(c => (
            <TabsTrigger key={c} value={c} className="capitalize text-xs">{c.replace("_", " ")}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets
                .filter(a => cat === "all" || a.category === cat)
                .map(asset => {
                  const Icon = categoryIcons[asset.category] || Image;
                  return (
                    <Card key={asset.id} className="overflow-hidden">
                      {asset.category === "banner" && asset.fileUrl && (
                        <img src={asset.fileUrl} alt={asset.title} className="w-full h-40 object-cover" />
                      )}
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs capitalize">{asset.category?.replace("_", " ")}</Badge>
                        </div>
                        <h3 className="font-semibold text-sm">{asset.title}</h3>
                        {asset.description && <p className="text-xs text-muted-foreground">{asset.description}</p>}
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              {assets.filter(a => cat === "all" || a.category === cat).length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">No assets in this category</div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default InfluencerAssets;
