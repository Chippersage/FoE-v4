interface Props {
  media: {
    type: string;
    url: string;
  };
}

export default function MediaRenderer({ media }: Props) {

  if (!media) return null;

  if (media.type === "image") {
    return (
      <img
        src={media.url}
        alt="activity media"
        className="max-w-full rounded-lg shadow-md"
      />
    );
  }

  if (media.type === "video") {
    return (
      <video
        controls
        className="max-w-full rounded-lg shadow-md"
      >
        <source src={media.url} />
        Your browser does not support video.
      </video>
    );
  }

  if (media.type === "youtube") {
    return (
      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-lg"
          src={media.url}
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}