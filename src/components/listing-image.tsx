import { useSignedUrl } from "@/hooks/use-signed-url";
import { ImageOff } from "lucide-react";

export function ListingImage({ path, alt, className }: { path: string | null; alt: string; className?: string }) {
  const url = useSignedUrl(path);
  if (!path) return (
    <div className={`grid h-full w-full place-items-center bg-muted text-muted-foreground ${className ?? ""}`}>
      <ImageOff className="h-8 w-8" />
    </div>
  );
  return <img src={url ?? undefined} alt={alt} className={`h-full w-full object-cover transition ${className ?? ""}`} />;
}