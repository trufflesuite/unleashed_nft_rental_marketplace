import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div id="layout">
      <div className="menu-container">
        <ul>
          <li><Link to="/market">Market</Link></li>
          <li><Link to="/list">List</Link></li>
        </ul>
      </div>
      <div className="page-container">
        <h1>Unleashed</h1>
        <Outlet />
      </div>
    </div>
  );
}

export { Layout };
