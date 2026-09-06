const loadingSteps = [10, 20, 30, 40, 100]

export default function OpeningOverlay() {
  return <div className="opening-overlay" data-opening-overlay aria-hidden="true">
    <div className="opening-panel" />
    <div className="opening-loader" data-opening-loader>
      <div className="opening-number-window">
        {loadingSteps.map((value) => <span className="opening-number" data-opening-number key={value}>
          <strong>{value}</strong><em>%</em>
        </span>)}
      </div>
      <div className="opening-progress"><i data-opening-progress /></div>
    </div>
  </div>
}
