import Link from "next/link";

const menuItems = [
  {
    number: "01",
    title: "LAST ASCENT",
    description: "Climb the tower. Fight back. Escape the rising horde.",
    status: "PLAY NOW",
    active: true,
  },
  {
    number: "02",
    title: "MISSION FILES",
    description: "Objective-based stages and learning challenges.",
    status: "COMING SOON",
    active: false,
  },
  {
    number: "03",
    title: "LEADERBOARD",
    description: "See how far other survivors have climbed.",
    status: "COMING SOON",
    active: false,
  },
  {
    number: "04",
    title: "SETTINGS",
    description: "Audio, display and control preferences.",
    status: "COMING SOON",
    active: false,
  },
];

function TowerArtwork() {
  return (
    <div className="tower-art" aria-hidden="true">
      <div className="tower-art__moon" />
      <div className="tower-art__glow" />
      <div className="tower-art__building tower-art__building--back" />
      <div className="tower-art__building tower-art__building--front">
        {Array.from({ length: 5 }, (_, floor) => (
          <div className="tower-art__floor" key={floor}>
            {Array.from({ length: 4 }, (_, window) => (
              <span
                className={
                  (floor + window) % 3 === 0
                    ? "tower-art__window tower-art__window--lit"
                    : "tower-art__window"
                }
                key={window}
              />
            ))}
          </div>
        ))}
        <div className="tower-art__roof-line" />
      </div>
      <div className="tower-art__survivor">
        <span className="tower-art__survivor-head" />
        <span className="tower-art__survivor-body" />
      </div>
      <div className="tower-art__warning-line">
        <span>HORDE APPROACHING</span>
      </div>
      <div className="tower-art__coordinates">SECTOR 07 · NIGHTFALL</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="menu-shell">
      <div className="menu-noise" aria-hidden="true" />

      <div className="menu-container">
        <header className="menu-header">
          <Link className="brand" href="/" aria-label="Zombie Tower home">
            <span className="brand__mark">ZT</span>
            <span className="brand__name">
              <strong>ZOMBIE TOWER</strong>
              <small>LAST ASCENT</small>
            </span>
          </Link>

          <a
            className="repository-link"
            href="https://github.com/thanaphatpan25-pixel/zombie-tower"
            target="_blank"
            rel="noreferrer"
          >
            VIEW PROJECT <span aria-hidden="true">↗</span>
          </a>
        </header>

        <section className="hero-section" aria-labelledby="game-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow__pulse" /> 2D ZOMBIE SURVIVAL PLATFORMER
            </p>

            <h1 className="hero-title" id="game-title">
              <span>ZOMBIE</span>
              <span className="hero-title__accent">TOWER</span>
              <span className="hero-title__subtitle">LAST ASCENT</span>
            </h1>

            <p className="hero-description">
              The tower is your only way up. Climb higher, fight the infected,
              and stay ahead of the rising horde.
            </p>

            <div className="hero-actions">
              <Link className="action-button action-button--primary" href="/game/">
                PLAY GAME <span aria-hidden="true">▶</span>
              </Link>
              <a className="action-button action-button--secondary" href="#how-to-play">
                HOW TO PLAY
              </a>
            </div>

            <p className="build-label">
              <span /> PROTOTYPE BUILD · DEVELOPMENT IN PROGRESS
            </p>
          </div>

          <TowerArtwork />
        </section>

        <section className="mode-section" aria-label="Game modes and features">
          {menuItems.map((item) =>
            item.active ? (
              <Link className="mode-card mode-card--active" href="/game/" key={item.number}>
                <span className="mode-card__number">{item.number} / SURVIVAL</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <span className="mode-card__status mode-card__status--active">
                  {item.status} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ) : (
              <div
                className="mode-card mode-card--locked"
                key={item.number}
                aria-label={`${item.title}, coming soon`}
              >
                <span className="mode-card__number">{item.number} / FEATURE</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <span className="mode-card__status">{item.status}</span>
              </div>
            ),
          )}
        </section>

        <section className="controls-section" id="how-to-play">
          <div className="controls-heading">
            <p className="eyebrow">SURVIVOR FIELD GUIDE</p>
            <h2>HOW TO SURVIVE</h2>
          </div>
          <div className="control-list">
            <div className="control-item">
              <span className="control-item__keys">← →</span>
              <span className="control-item__label">MOVE</span>
            </div>
            <div className="control-item">
              <span className="control-item__keys">SPACE / ↑</span>
              <span className="control-item__label">JUMP</span>
            </div>
            <div className="control-item">
              <span className="control-item__keys">J / X</span>
              <span className="control-item__label">ATTACK</span>
            </div>
            <div className="control-item">
              <span className="control-item__keys">TOUCH</span>
              <span className="control-item__label">MOBILE CONTROLS</span>
            </div>
          </div>
        </section>

        <footer className="menu-footer">
          <span>© ZOMBIE TOWER: LAST ASCENT</span>
          <span>CLIMB TO SURVIVE.</span>
          <span>BUILT WITH NEXT.JS + PHASER</span>
        </footer>
      </div>
    </main>
  );
}
