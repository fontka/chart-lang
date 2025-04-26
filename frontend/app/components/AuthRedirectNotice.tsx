import { Link } from "@remix-run/react";

interface AuthRedirectNoticeProps {
  message: string;
  linkText: string;
  to: string;
}

export default function AuthRedirectNotice({
  message,
  linkText,
  to,
}: AuthRedirectNoticeProps) {
  return (
    <div className="flex justify-content-center mt-3 text-sm">
      <span>{message}</span>
      <Link to={to} className="text-blue-500 hover:underline ml-2">
        {linkText}
      </Link>
    </div>
  );
}
