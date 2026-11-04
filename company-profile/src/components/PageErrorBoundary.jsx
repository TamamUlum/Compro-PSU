import { Component } from "react";
import { useLanguage } from "../context/useLanguage";
import "./PageErrorBoundary.css";

function PageErrorFallback({ onRetry }) {
  const { lang } = useLanguage();

  return (
    <div className="page-error" role="alert">
      <h1>{lang === "en" ? "Page could not be loaded" : "Halaman gagal dimuat"}</h1>
      <p>
        {lang === "en"
          ? "An unexpected error occurred. Please try again."
          : "Terjadi kendala saat memuat halaman. Silakan coba lagi."}
      </p>
      <button type="button" className="page-error__retry" onClick={onRetry}>
        {lang === "en" ? "Try again" : "Coba lagi"}
      </button>
    </div>
  );
}

export default class PageErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page failed to render:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <PageErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
