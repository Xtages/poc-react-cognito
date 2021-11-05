import {ChangeEvent, FormEvent, useState} from 'react';
import {Credentials, useAuth} from '../hooks/useAuth';

type CredentialsKeys = keyof Credentials;

/**
 * Login page.
 */
export default function LoginPage() {
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: ''
  });
  const auth = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await auth.logIn(credentials);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {
      name,
      value
    } = event.target;

    const key = name as CredentialsKeys;
    setCredentials({
      ...credentials,
      [key]: value,
    });
  }

  return (
      <form onSubmit={handleSubmit}>
        <label>Email:
          <input
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
          />
        </label>
        <label>Password:
          <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
          />
        </label>
        <button type="submit">Log in</button>
      </form>
  );
}
