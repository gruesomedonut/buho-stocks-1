import { hasFlag } from "country-flag-icons";
import Flags from "country-flag-icons/react/3x2";

interface Props {
  code: string;
}

export default function CountryFlag({ code }: Props) {
  let countryCode = code;
  if (code === "EUR") {
    countryCode = "EU";
  }
  if (!countryCode || !hasFlag(countryCode.toUpperCase())) return null;
  const FlagComponent = Flags[countryCode.toUpperCase() as keyof typeof Flags];
  return <FlagComponent style={{ maxHeight: 20 }} />;
}
