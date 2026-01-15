// Mock minimaliste de react-router-dom pour les tests unitaires
const React = require('react');

module.exports = {
  __esModule: true, // Indique que c'est un module ES

  // Simule le composant BrowserRouter en rendant simplement ses enfants
  BrowserRouter: ({ children }) => children,

  // Simule MemoryRouter (utile pour les tests) de la même manière
  MemoryRouter: ({ children }) => children,

  // Simule le composant Routes qui contient plusieurs Route
  Routes: ({ children }) => children,

  // Simule le composant Route, qui rend juste l'élément passé
  Route: ({ element }) => element,

  // Simule le composant Link (navigateur) en ne rendant que ses enfants
  Link: ({ children }) => children,

  // Simule NavLink (link avec style actif) pareil
  NavLink: ({ children }) => children,

  // useNavigate retourne une fonction vide simulant la navigation
  useNavigate: () => () => {},

  // useParams retourne un objet vide simulant les paramètres de l'URL
  useParams: () => ({}),

  // useLocation retourne un objet simulant l'emplacement actuel
  useLocation: () => ({ pathname: '/' }),

  // Navigate retourne null car on ne fait pas de vraie navigation dans les tests
  Navigate: ({ to }) => null,
};
