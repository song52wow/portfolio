type VideoPlayerProps = {
  src: string;
  poster?: string;
  title: string;
};

export function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  return (
    <video
      className="w-full rounded-xl bg-black"
      controls
      preload="metadata"
      poster={poster}
      playsInline
      aria-label={`${title} 视频`}
    >
      <source src={src} type="video/mp4" />
      您的浏览器不支持 HTML5 视频播放。
    </video>
  );
}
