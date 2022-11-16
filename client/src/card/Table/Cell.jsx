import { trim, isIpfsUri, getIpfsGatewayUri } from "../../utils";

function Cell({
  name,
  value,
  valueTrim,
  defaultValue = "?"
}) {
  if (value) {
    const originalValue = value;

    if (valueTrim) {
      const { leftSize, rightSize, ellipsisLen } = valueTrim;
      value = trim(value, leftSize, rightSize, ellipsisLen);
    }

    if (isIpfsUri(originalValue)) {
      value =
        <a
          href={getIpfsGatewayUri(originalValue)}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>;
    }
  }

  return (
    <tr>
      <td>{name}</td>
      <td>{value || defaultValue}</td>
    </tr>
  );
}

export { Cell };
