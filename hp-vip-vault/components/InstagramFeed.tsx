import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { VAULT_BLUR_PLACEHOLDER } from "@/lib/image";

type Post = {
  media_id: string;
  caption: string | null;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  permalink: string;
};

function InstagramFallbackCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm text-gray-500">Feed unavailable right now.</p>
      <Link
        href="https://instagram.com/horsepower.vip"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
      >
        Follow @horsepower.vip on Instagram
      </Link>
    </div>
  );
}

export default async function InstagramFeed() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data, error } = await supabase
    .from("instagram_posts")
    .select("media_id, caption, media_type, media_url, thumbnail_url, permalink")
    .order("sort_order", { ascending: true })
    .limit(12);

  if (error) console.error(error);
  const posts = (data as Post[] | null) ?? [];

  if (posts.length === 0) {
    return <InstagramFallbackCard />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {posts.map((post) => (
        <Link
          key={post.media_id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-square bg-black border border-white/5 rounded-2xl overflow-hidden transition-all duration-700 hover:border-orange-500/50 hover:scale-[1.02]"
        >
          <Image
            src={post.media_type === "VIDEO" ? post.thumbnail_url ?? post.media_url : post.media_url}
            alt={post.caption?.slice(0, 80) ?? "Instagram post"}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            placeholder="blur"
            blurDataURL={VAULT_BLUR_PLACEHOLDER}
            className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
        </Link>
      ))}
    </div>
  );
}
