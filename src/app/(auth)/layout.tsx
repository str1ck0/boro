import { FloatingIcons } from "@/components/floating-icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
      <div className="sticky top-0 hidden h-dvh lg:block">
        <FloatingIcons />
      </div>
      <div className="flex flex-col items-center px-6 pb-10 pt-8 sm:px-12 lg:justify-center">
        <div className="-mx-6 h-[min(40dvh,300px)] w-screen max-w-[480px] sm:mx-0 lg:hidden">
          <FloatingIcons variant="banner" />
        </div>
        <div className="mt-8 w-full max-w-sm lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
