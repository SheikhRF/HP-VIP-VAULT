'use client';
import { useEffect } from 'react';

type InstagramEmbedProps = {
  url: string; // link to the post
};

export function InstagramEmbed({ url }: InstagramEmbedProps) {
  useEffect(() => {
    // @ts-ignore
    if (window.instgrm) {
      // @ts-ignore
      window.instgrm.Embeds.process();
    }
  }, []);

  return (
    <div className="flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ maxWidth: 540, width: '100%' }}
      />
      <script async src="//www.instagram.com/embed.js" />
    </div>
  );
}
