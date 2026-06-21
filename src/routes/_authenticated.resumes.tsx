import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/resumes")({
  component: ResumesPage,
});

function ResumesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: resumes } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const r = resumes?.find((x) => x.id === id);
      if (r?.file_path) await supabase.storage.from("resumes").remove([r.file_path]);
      await supabase.from("resumes").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (max 5MB)");
    setBusy(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file);
      if (upErr) throw upErr;
      // Naive text extraction client-side: only works for txt; PDF parsing TODO server-side.
      let raw = "";
      if (file.type === "text/plain") raw = await file.text();
      const { error } = await supabase.from("resumes").insert({
        user_id: user.id,
        file_name: file.name,
        file_path: path,
        raw_text: raw || null,
      });
      if (error) throw error;
      toast.success("Resume uploaded");
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Resumes</p>
        <h1 className="mt-1 font-display text-4xl">Your resume library</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Upload your resume so interviews can adapt to your real background. PDF parsing & ATS scoring run in the
          next module — for now upload .txt to feed raw text into questions.
        </p>
      </header>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-border bg-card p-6 hover:border-terracotta">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-terracotta" />
          <div>
            <div className="font-medium">{busy ? "Uploading…" : "Upload resume"}</div>
            <div className="text-sm text-muted-foreground">PDF or .txt, up to 5MB</div>
          </div>
        </div>
        <input type="file" accept=".pdf,.txt" className="sr-only" onChange={onFile} disabled={busy} />
        <span className="text-sm text-terracotta">Choose file</span>
      </label>

      <div className="mt-10 space-y-3">
        {resumes?.length ? (
          resumes.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{r.file_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                    {r.ats_score != null && <> · ATS {r.ats_score}</>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => del.mutate(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No resumes uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
