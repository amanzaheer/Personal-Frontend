import { Search } from 'lucide-react'

export default function SearchBox({
  className,
  value,
  onChange,
  placeholder,
  inputClass,
  inputPadding,
  name,
}) {
  return (
    <div
      className={`flex items-center w-full appearance-none px-3 flex-1 border rounded ${className}`}
    >
      <Search className="w-5 h-5" />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-transparent flex-1 w-full outline-none ml-3 appearance-none ${inputClass} ${
          inputPadding ? inputPadding : 'py-[7px]'
        }`}
      />
    </div>
  )
}
