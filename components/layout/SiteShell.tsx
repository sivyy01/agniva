"use client";

import {
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/header/SiteHeader";
import { IntroOverlay } from "@/components/intro/IntroOverlay";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({
  children,
}: SiteShellProps) {
  const pathname = usePathname();

  /*
   * Запоминаем страницу, с которой
   * реально был открыт сайт.
   *
   * При внутренних переходах
   * initialPath уже не изменяется.
   */
  const [initialPath] = useState(pathname);

  /*
   * Пока общий Header подключаем
   * к Главной и Афише.
   *
   * Меню и Доставку перенесём
   * следующим этапом.
   */
  const showSharedHeader = [
  "/",
  "/menu",
  "/delivery",
  "/events",
].includes(pathname);

  /*
   * Заставка показывается только если
   * сайт был реально открыт на главной.
   *
   * F5 на главной → снова появится.
   * Внутренние переходы → не появится.
   */
  const showIntro =
    initialPath === "/";

  return (
    <>
      {showSharedHeader && <SiteHeader />}

      {showIntro && <IntroOverlay />}

      {children}
    </>
  );
}