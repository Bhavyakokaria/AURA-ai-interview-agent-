'use client';
export default function AnimatedBackground() {
  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
      <div className="grid-overlay" />
    </>
  );
}