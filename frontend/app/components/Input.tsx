import { InputText } from "primereact/inputtext";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import { Nullable } from "primereact/ts-helpers";

interface InputProps {
  value?: Nullable<string>;
  onChange?: (event: InputMaskChangeEvent | React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  label?: string;
  mask?: string;
  placeholder?: string;
  labelClassName: string;
  type?: string; 
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
  ...rest
}: InputProps) {
  return (
    <div className="p-field mb-2 w-full">
      {label && (
        <label htmlFor={name} className={`p-d-block ${labelClassName}`}>
          {label}
        </label>
      )}
      {mask ? (
        <InputMask
          value={value}
          onChange={onChange}
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
          {...rest}
        />
      )}
    </div>
  );
}
