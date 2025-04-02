import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import { Nullable } from "primereact/ts-helpers";

export default function Input({
  value,
  onChange,
  name,
  label,
  mask,
  placeholder,
  ...rest
}: {
  value?: Nullable<string>;
  onChange: (event: InputMaskChangeEvent) => void;
  name: string;
  label?: string;
  mask?: string;
  placeholder?: string;
}) {
  return (
    <div className="p-field mb-2 w-full">
      {label && (
        <label htmlFor="mask" className="p-d-block">
          {label}
        </label>
      )}
      <InputMask
        value={value}
        onChange={onChange}
        className="w-full"
        mask={mask ?? ""}
        name={name}
        {...rest}
        placeholder={placeholder}
      />
    </div>
  );
}
