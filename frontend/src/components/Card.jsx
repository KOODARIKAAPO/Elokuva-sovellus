export default function Card({ title, description, children, className = "" }) {
  const classes = ["card", className].filter(Boolean).join(" ");
  return (
    <section className={classes}>
      {title && <h2>{title}</h2>}
      {description && <p className="hint">{description}</p>}
      {children}
    </section>
  );
}
