import {Link} from 'react-router-dom';
import React from 'react';
import {useAuth} from '../../hooks/useAuth';

export default function NavBar() {
  const {logOut} = useAuth();

  async function handleLogOut() {
    await logOut();
  }

  return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <button onClick={handleLogOut}>Log out</button>
          </li>
        </ul>
      </nav>
  );
}
