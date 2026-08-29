import { Select } from "../../../ui";
import { OPERATION_TYPES, WITHHOLDING_TYPES } from "../../../../utils/taxNature";

const TaxNatureFields = ({
  operationType,
  withholdingType,
  onOperationType,
  onWithholdingType,
  disabled = false,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-xs text-fg-60 mb-1">VAT operation type</label>
      <Select
        value={operationType || "general"}
        onChange={(event) => onOperationType(event.target.value)}
        disabled={disabled}
      >
        {OPERATION_TYPES.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </Select>
      <p className="text-xs text-fg-60 mt-1">Used for Modelo 303. Not read from the description.</p>
    </div>
    <div>
      <label className="block text-xs text-fg-60 mb-1">Withholding type</label>
      <Select
        value={withholdingType || "none"}
        onChange={(event) => onWithholdingType(event.target.value)}
        disabled={disabled}
      >
        {WITHHOLDING_TYPES.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </Select>
      <p className="text-xs text-fg-60 mt-1">Rental → 115, professional → 111. Description is ignored.</p>
    </div>
  </div>
);

export default TaxNatureFields;
