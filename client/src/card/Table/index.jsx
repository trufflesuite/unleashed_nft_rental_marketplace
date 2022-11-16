import { Cell } from "./Cell";

function Table({ children }) {
  return (
    <div className="table-container">
      <table>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

Table.Cell = Cell;

export { Table };
