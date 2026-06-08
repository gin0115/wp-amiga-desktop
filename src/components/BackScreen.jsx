// Placeholder back screen for step4. Real content (powered-off CRT look,
// power gadget, SAE canvas) lands in step7+9.
export default function BackScreen() {
  return (
    <div className="back-screen" data-testid="back-screen">
      <p className="back-screen-placeholder">AROS Workbench — drag to reveal</p>
    </div>
  );
}
