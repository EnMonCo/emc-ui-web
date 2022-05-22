import React from 'react';
import PropTypes from 'prop-types';
import superagent from 'superagent';
import User from '../entities/User';
import { EMC_ACCOUNTS_V1 } from '../config';

const Context = React.createContext({
  getUser() {
    return null;
  },
  isLogged: false,
  login(user) {},
  logout() {},
});

export const displayName = "AuthProvider";

/**
 * AuthProvider - React provider for Auth system. Place it to the root of layout.
 * @function
 * @param props - Properties of the component.
 */
export function AuthProvider(props) {
  const {
    children
  } = props;
  const [logged, setLogged] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const localStorageUser = getUserFromLocalStorage();
    if (localStorageUser) {
      superagent
        .get(`${EMC_ACCOUNTS_V1}/auth/me`)
        .set(`Authorization`, `Bearer ${localStorageUser.bearerToken}`)
        .then((res) => {
          const user = new User({ ...res.body, bearerToken: localStorageUser.bearerToken });
          if (res.body.updatedAt === localStorageUser.updatedAt) {
            setUser(user);
            setLogged(true);
          } else {
            login(user)
          }
          setLoaded(true);
        })
    } else {
      setUser(null);
      setLogged(false);
      setLoaded(true);
    }

  }, []);

  React.useEffect(() => {
    window.addEventListener("storage", changeStorage);
    return () => window.removeEventListener("storage", changeStorage);
  });

  function changeStorage(event) {
    if (!event.newValue && logged) {
      logout();
    }
  }

  function logout() {
    localStorage.user = null;
    setLogged(false);
    setUser(null);
  }

  function getUserFromLocalStorage() {
    try {
      const credentials = JSON.parse(localStorage.user);
      const user = credentials ? new User({
        id: +credentials.id,
        firstName: String(credentials.firstName),
        lastName: String(credentials.lastName),
        email: String(credentials.email),
        deletedAt: new Date(credentials.deletedAt),
        createdAt: new Date(credentials.createdAt),
        updatedAt: new Date(credentials.updatedAt),
        photo: credentials.photo ? String(credentials.photo) : undefined,
        bearerToken: String(credentials.bearerToken),
        role: {
          id: +credentials.role.id,
          name: String(credentials.role.name),
        },
        status: {
          id: +credentials.status.id,
          name: String(credentials.status.name),
        },
      }) : null;
      if (user && !user.id) {
        logout();
        return null;
      }
      return user;
    } catch (error) {
      logout();
    }
    return null;
  }

  /**
   * getUser - Get user from context.
   * @function
   * @returns {User} - Users.
   */
  function getUser() {
    if (!user) {
      logout();
      return null;
    }
    return user;
  }

  function login(user) {
    localStorage.user = JSON.stringify(user);
    setUser(user);
    setLogged(true);
  }

  if (!loaded) return null;

  return (
    <Context.Provider value={{ isLogged: logged, getUser, login, logout }}>
      {children}
    </Context.Provider>
  );
}

AuthProvider.displayName = displayName;

AuthProvider.propTypes = {
  children: PropTypes.node
};

/**
 * useAuth - React hook, designed to work with user authentication.
 * @function
 * @example
 * function MyComponent(props) {
 *     const {user, isLoggedIn} = useAuth();
 *     return (
 *         <div>
 *             {user?.username}
 *         </div>
 *     );
 * }
 */
const useAuth = () => React.useContext(Context)
export default useAuth;
