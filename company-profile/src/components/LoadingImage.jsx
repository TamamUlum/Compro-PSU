import { useState } from "react";
import "./LoadingImage.css";

export default function LoadingImage(props) {
  return <LoadingImageState key={props.src} {...props} />;
}

function LoadingImageState({
  src,
  alt,
  className = "",
  loading = "lazy",
}) {
  const [status, setStatus] = useState("loading");

  const handleLoad = () => setStatus("loaded");
  const handleError = () => setStatus("error");

  return (
    <span
      className={`loading-image loading-image--${status}`}
      aria-busy={status === "loading"}
    >
      {status === "loading" && (
        <span className="loading-image__spinner" aria-hidden="true" />
      )}
      {status === "error" ? (
        <span className="loading-image__error" role="img" aria-label={alt}>
          {alt}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </span>
  );
}
