import { useState, useEffect } from 'react';
import './WatermarkedViewer.css';

interface WatermarkedViewerProps {
  data: {
    share?: any;
    member?: any;
  };
  onReset: () => void;
}

export default function WatermarkedViewer({ data, onReset }: WatermarkedViewerProps) {
  const [viewTime] = useState(new Date().toLocaleString());
  const [showWarning, setShowWarning] = useState(false);

  // Get result data from share
  const result = data.share?.share_results?.[0]?.test_results;
  
  if (!result) {
    return <div>No results found</div>;
  }

  // Prevent right-click
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'S')
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventKeyboardShortcuts);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
    };
  }, []);

  // Partial member ID for privacy
  const partialMemberId = data.member?.member_id 
    ? data.member.member_id.slice(0, 3) + '••••' + data.member.member_id.slice(-2)
    : 'N/A';

  return (
    <div className="watermarked-container">
      {/* Security Warning Popup */}
      {showWarning && (
        <div className="security-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <p>Copying is disabled for security.</p>
            <p>Verify authenticity at myhealthstatus.org</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="verification-header">
        <div className="header-content">
          <img 
            src="/my_health.png" 
            alt="MyHealthStatus" 
            className="header-logo"
          />
          <div className="header-text">
            <h2>🔒 Verified Results</h2>
            <p>MyHealthStatus Official Verification</p>
          </div>
        </div>
      </div>

      {/* Watermark Layers */}
      <div className="watermark-layers">
        {/* Diagonal watermark with logo */}
        <div className="watermark-diagonal">
          <img 
            src="/my_health.png" 
            alt="" 
            className="watermark-logo"
          />
          <div className="watermark-text">
            VERIFIED BY<br/>
            MYHEALTHSTATUS<br/>
            <span className="watermark-time">{viewTime}</span><br/>
            <span className="watermark-id">Share ID: {data.share?.share_token}</span>
          </div>
        </div>

        {/* Repeating pattern */}
        <div className="watermark-pattern">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pattern-item">
              <img src="/my_health.png" alt="" />
              <span>VERIFIED</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="document-viewer">
        {result.file_type === 'application/pdf' ? (
          <iframe
            src={`${result.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="pdf-viewer"
            title="Test Results"
          />
        ) : (
          <img 
            src={result.file_url} 
            alt="Test Results" 
            className="image-viewer"
            draggable="false"
          />
        )}
      </div>

      {/* Verification Footer */}
      <div className="verification-footer">
        <div className="footer-warning">
          <span className="warning-icon">⚠️</span>
          <div className="warning-text">
            <strong>IMPORTANT NOTICE:</strong>
            <ul>
              <li>Screenshots and copies are NOT verified</li>
              <li>This page is the only official source</li>
              <li>Verify authenticity at: myhealthstatus.org/verify/{data.share?.share_token}</li>
            </ul>
          </div>
        </div>

        <div className="footer-details">
          <div className="detail-row">
            <span className="label">Member ID:</span>
            <span className="value">{partialMemberId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Test Date:</span>
            <span className="value">{result.test_date}</span>
          </div>
          <div className="detail-row">
            <span className="label">Facility:</span>
            <span className="value">{result.facility_name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Viewed:</span>
            <span className="value">{viewTime}</span>
          </div>
        </div>

        <div className="footer-actions">
          <button 
            onClick={onReset}
            className="verify-another-btn"
          >
            Verify Another
          </button>
        </div>

        <div className="footer-logo">
          <img src="/my_health.png" alt="MyHealthStatus" />
          <p>Powered by MyHealthStatus</p>
        </div>
      </div>

      {/* Print Watermark */}
      <div className="print-watermark">
        <img src="/my_health.png" alt="" className="print-logo" />
        <div className="print-text">
          UNOFFICIAL COPY<br/>
          VERIFY AT MYHEALTHSTATUS.ORG<br/>
          Share ID: {data.share?.share_token}
        </div>
      </div>
    </div>
  );
}