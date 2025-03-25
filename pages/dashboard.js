import Layout from "@/components/layout";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("scan_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setResults(data);

      setLoading(false);
    };

    fetchResults();
  }, []);

  const getRiskVariant = (risk) => {
    if (risk === "public") return "destructive";
    if (risk === "medium") return "warning";
    if (risk === "low") return "success";
    return "default";
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">🛡️ Cloud Scan Results</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Card>
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500 uppercase text-xs border-b">
              <tr>
                <th className="p-3">Bucket</th>
                <th className="p-3">Region</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Scanned At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{row.bucket}</td>
                  <td className="p-3">{row.region}</td>
                  <td className="p-3">
                    <Badge variant={getRiskVariant(row.risk_level)}>
                      {row.risk_level}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Layout>
  );
}