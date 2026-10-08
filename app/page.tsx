/* Native images keep the supplied SVG icons byte-for-byte. */
/* eslint-disable @next/next/no-img-element */
const categories = [
  { id: "sedans", name: "Sedans", noun: "sedan", icon: "/images/icon-sedans.svg", copy: "Choose a sedan for its affordability and excellent fuel economy. Ideal for cruising in the city or on your next road trip." },
  { id: "suvs", name: "SUVs", noun: "SUV", icon: "/images/icon-suvs.svg", copy: "Take an SUV for its spacious interior, power, and versatility. Perfect for your next family vacation and off-road adventures." },
  { id: "luxury", name: "Luxury", noun: "luxury car", icon: "/images/icon-luxury.svg", copy: "Cruise in the best car brands without the bloated prices. Enjoy the enhanced comfort of a luxury rental and arrive in style." },
];

export default function Home() {
  return (
    <>
      <main>
        <h1 className="sr-only">Car rental categories</h1>
        <div className="columns">
          {categories.map(category => (
            <section key={category.id} className={`column column-${category.id}`} aria-labelledby={`${category.id}-title`}>
              <img src={category.icon} width={64} height={40} alt="" />
              <h2 id={`${category.id}-title`}>{category.name}</h2>
              <p className="copy">{category.copy}</p>
              <details className="learn-more">
                <summary>Learn More<span className="sr-only"> about {category.name}</span></summary>
                <p className="demo-note">Demo only: this practice card has no {category.noun} listings or booking behind it.</p>
              </details>
            </section>
          ))}
        </div>
      </main>
      <footer><span className="site-name">3-column preview card</span>. Challenge by <a href="https://www.frontendmentor.io/challenges/3column-preview-card-component-pH92eAR2-">Frontend Mentor</a>. Built by <a href="https://royeradames.com">Royer Adames</a>.</footer>
    </>
  );
}
