import type { ReactNode } from "react"

import LogoutButton from "@/components/LogoutButton";
export default function DriverLayout({ children }: { children: ReactNode }) {
  return <>{children}
    <LogoutButton />
  </>;
}
