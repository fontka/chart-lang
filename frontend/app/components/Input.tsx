import { InputText } from "primereact/inputtext";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import { Nullable } from "primereact/ts-helpers";
import { FloatLabel } from "primereact/floatlabel";

interface InputProps {
  value?: Nullable<string>;
  onChange?: (
    event: InputMaskChangeEvent | React.ChangeEvent<HTMLInputElement>
  ) => void;
  name: string;
  label?: string;
  mask?: string;
  placeholder?: string;
  labelClassName: string;
  type?: string;
  errorMessage?: string[];
}

export default function Input({
  value,
  onChange,
  name,
  label,
  mask,
  placeholder,
  labelClassName,
  type = "text",
  errorMessage,
  ...rest
}: InputProps) {
  return (
    <div className="relative">
      <FloatLabel className="mb-3 w-full">
        {label && (
          <label htmlFor={name} className={`p-d-block ${labelClassName}`}>
            {label}
          </label>
        )}
        {mask ? (
          <InputMask
            mask={mask}
            name={name}
            placeholder={placeholder}
            className="w-full"
            {...rest}
          />
        ) : (
          <InputText
            value={value}
            onChange={onChange}
            type={type}
            name={name}
            placeholder={placeholder}
            className="w-full"
            invalid={errorMessage && errorMessage.length > 0}
            {...rest}
          />
        )}
      </FloatLabel>
      {errorMessage && errorMessage.length > 0 && (
        <p
          className="absolute text-xs"
          style={{ left: "5px", bottom: "-12px", color: "red" }}
        >
          {errorMessage ?? null}
        </p>
      )}
    </div>
  );
}
