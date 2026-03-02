import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";

const ReferralRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const track = async () => {
      if (!slug) { navigate("/signup"); return; }
      try {
        const q = query(collection(db, "influencers"), where("referralSlug", "==", slug), where("status", "==", "approved"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const infDoc = snap.docs[0];
          localStorage.setItem("referralSlug", slug);
          await updateDoc(doc(db, "influencers", infDoc.id), { totalClicks: increment(1) });
        }
      } catch (err) {
        console.error("Referral tracking error:", err);
      }
      navigate("/signup");
    };
    track();
  }, [slug, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

export default ReferralRedirect;
