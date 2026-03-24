import { NavLink } from 'react-router-dom';

export function AltNavbar() {
  return (
    <nav aria-label="Main Navigation">
      <ul>
        <li>
          <NavLink to="/">Landing</NavLink>
        </li>
        <li>
          <NavLink to="/search">Search Properties</NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact</NavLink>
        </li>
        <li>
          <NavLink to="/reservations">View Reservations</NavLink>
        </li>
        <li>
          <NavLink to="/terms-and-conditions">Terms and Conditions</NavLink>
        </li>
      </ul>
    </nav>
  );
}
