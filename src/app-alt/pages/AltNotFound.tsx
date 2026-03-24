import { Link } from 'react-router-dom';

export default function AltNotFound() {
  return (
    <section>
      <h2>Page Not Found</h2>
      <Link to="/">Go to Landing</Link>
    </section>
  );
}
