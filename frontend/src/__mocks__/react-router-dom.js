// Minimal manual mock for react-router-dom used in tests
const React = require('react');

module.exports = {
  __esModule: true,
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Link: ({ children }) => children,
  NavLink: ({ children }) => children,
  useNavigate: () => () => {},
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  Navigate: ({ to }) => null,
};
