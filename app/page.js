import Link from "next/link";
import { PROJECT_IMAGES } from "../lib/productImages";

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-copy fade-up">
          <p className="eyebrow">Crowdsourced price verification</p>
          <h1>Know if a price is fair before you buy.</h1>
          <p className="lead">
            PRICETER helps consumers in Tagum City and nearby communities compare
            observed local prices with community medians and DTI Suggested Retail
            Prices. No account is required.
          </p>
          <div className="hero-actions">
            <Link href="/search" className="button-primary">
              Search prices
            </Link>
            <Link href="/report" className="button-secondary">
              Report a price
            </Link>
          </div>
        </div>
        <img
          className="hero-image fade-up"
          src={PROJECT_IMAGES.choose}
          alt="A shopper comparing products in a grocery aisle"
        />
      </section>

      <section className="landing-section">
        <h2>What PRICETER is</h2>
        <p>
          PRICETER is a web-based, community-driven way to verify prices from
          small stores, sari-sari stores, and local vendors. Users anonymously
          submit a product name, price, location, and a real-time photo. The
          system then aggregates those reports so other consumers can make a more
          informed choice.
        </p>
        <img
          className="landing-photo"
          src={PROJECT_IMAGES.aisle}
          alt="A grocery aisle with everyday products"
        />
      </section>

      <section className="landing-section">
        <h2>How it works</h2>
        <div className="step-grid">
          <article className="info-card">
            <span>01</span>
            <h3>Search a product</h3>
            <p>Find reported items by name and see nearby community prices.</p>
          </article>
          <article className="info-card">
            <span>02</span>
            <h3>Compare references</h3>
            <p>View the latest DTI SRP, local median, and reported prices together.</p>
          </article>
          <article className="info-card">
            <span>03</span>
            <h3>Read the indicator</h3>
            <p>PRICETER classifies a price as Fair, High, or Overpriced.</p>
          </article>
          <article className="info-card">
            <span>04</span>
            <h3>Contribute anonymously</h3>
            <p>Capture a photo and share a report without creating an account.</p>
          </article>
        </div>
      </section>

      <section className="landing-section split">
        <div>
          <h2>How it helps you verify prices</h2>
          <p>
            Government SRP listings are a useful guide, but they may not match
            every local store. PRICETER fills that gap with community reports,
            barangay and city medians, and a clear price flag so you can notice
            when a price looks excessive.
          </p>
        </div>
        <img src={PROJECT_IMAGES.save} alt="Saving coins as a reminder to buy with care" />
      </section>

      <section className="landing-section">
        <h2>Price indicator and community trust</h2>
        <div className="step-grid">
          <article className="info-card">
            <h3>Fair / High / Overpriced</h3>
            <p>
              The indicator compares a reported price with the applicable DTI SRP
              and local median information.
            </p>
          </article>
          <article className="info-card">
            <h3>Community Trust Score</h3>
            <p>
              Other consumers rate whether a report looks consistent or unreliable.
              Trust stays anonymous.
            </p>
          </article>
          <article className="info-card">
            <h3>Local median</h3>
            <p>
              Medians are computed from nearby, barangay, and city reports so you
              can see typical prices around you.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section">
        <h2>How to submit a price report</h2>
        <ol className="report-steps">
          <li>Allow location so PRICETER can read your coordinates and address.</li>
          <li>Enter the product name and the price you observed.</li>
          <li>Capture a live camera photo of the price tag, receipt, menu, or product.</li>
          <li>Submit. Daily limits help reduce spam reports and ratings.</li>
        </ol>
        <Link href="/report" className="button-primary">
          Submit an anonymous report
        </Link>
      </section>
    </main>
  );
}
