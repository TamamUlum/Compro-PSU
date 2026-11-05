import LocalizedText from "./LocalizedText";
import { SILAPP_BASE_URL, SILAPP_DOMAIN } from "../utils/silappTracker";

export default function SilappWorkflowTracker({ workflow, onReset }) {
  if (!workflow) return null;

  const currentStep = workflow.current_step || {};
  const progressPct = typeof workflow.progress === "number" ? workflow.progress : 50;
  const steps = Array.isArray(workflow.steps) ? workflow.steps : [];

  return (
    <div className="cert-tracker__workflow">
      <div className="cert-tracker__workflow-header">
        <div className="cert-tracker__workflow-title-wrap">
          <div className="cert-tracker__workflow-badge">
            <span className="cert-tracker__workflow-pulse" />
            <span>Alur Permohonan Aktif SILAPP</span>
          </div>
          <h3 className="cert-tracker__workflow-appno">
            {workflow.application_no || workflow.tracking_code}
          </h3>
          <p className="cert-tracker__workflow-service">
            {workflow.service_name || "Layanan Penilaian Standar Uji"}
          </p>
        </div>

        <div className="cert-tracker__workflow-source-pill">
          <span>API Terverifikasi:</span>
          <strong>{SILAPP_DOMAIN}</strong>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="cert-tracker__progress-section">
        <div className="cert-tracker__progress-labels">
          <span className="cert-tracker__progress-stage">
            Tahap {currentStep.order || currentStep.index || 1} dari {currentStep.total || steps.length || 7}:{" "}
            <strong>{currentStep.name || "Pemrosesan Berkas"}</strong>
          </span>
          <span className="cert-tracker__progress-pct">{progressPct}% Selesai</span>
        </div>
        <div className="cert-tracker__progress-bar">
          <div
            className="cert-tracker__progress-fill"
            style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
          />
        </div>
      </div>

      {/* Kondisi Status */}
      <div className="cert-tracker__status-grid">
        <div className="cert-tracker__status-box">
          <span className="cert-tracker__status-label">Kode Lacak (Tracking Code)</span>
          <span className="cert-tracker__status-value cert-tracker__mono">
            {workflow.tracking_code || "-"}
          </span>
        </div>
        <div className="cert-tracker__status-box">
          <span className="cert-tracker__status-label">Status Saat Ini</span>
          <span className="cert-tracker__status-value">
            <span className="cert-tracker__badge cert-tracker__badge--active">
              <span className="cert-tracker__badge-dot" />
              {workflow.condition || "On Progress"}
            </span>
          </span>
        </div>
        <div className="cert-tracker__status-box">
          <span className="cert-tracker__status-label">Estimasi Pengerjaan</span>
          <span className="cert-tracker__status-value">
            {workflow.service_est || "Estimasi 14 - 30 hari kerja"}
          </span>
        </div>
        <div className="cert-tracker__status-box">
          <span className="cert-tracker__status-label">Update Terakhir</span>
          <span className="cert-tracker__status-value">
            {workflow.updated_at || workflow.last_update || "Hari ini"}
          </span>
        </div>
      </div>

      {/* Stepper Steps */}
      {steps.length > 0 && (
        <div className="cert-tracker__steps-list">
          <h4 className="cert-tracker__steps-title">
            <LocalizedText>Tahapan Siklus Layanan</LocalizedText>
          </h4>
          <div className="cert-tracker__stepper">
            {steps.map((st, idx) => {
              const isDone = st.state === "done" || idx + 1 < (currentStep.order || 1);
              const isCurrent = st.state === "current" || idx + 1 === (currentStep.order || 1);
              const stateClass = isDone
                ? "cert-tracker__step--done"
                : isCurrent
                ? "cert-tracker__step--current"
                : "cert-tracker__step--todo";

              return (
                <div key={st.code || idx} className={`cert-tracker__step ${stateClass}`}>
                  <div className="cert-tracker__step-dot">
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <div className="cert-tracker__step-content">
                    <span className="cert-tracker__step-name">{st.name}</span>
                    <span className="cert-tracker__step-status">
                      {isDone ? "Selesai" : isCurrent ? "Sedang Berjalan" : "Menunggu"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="cert-tracker__workflow-footer">
        <a
          href={SILAPP_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cert-tracker__btn cert-tracker__btn--portal"
        >
          <span>Masuk ke Portal SILAPP</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {onReset && (
          <button
            type="button"
            className="cert-tracker__btn cert-tracker__btn--secondary"
            onClick={onReset}
          >
            Lacak Nomor Lain
          </button>
        )}
      </div>
    </div>
  );
}

